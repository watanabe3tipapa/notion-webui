import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import {
  Root,
  Heading,
  Paragraph,
  List,
  ListItem,
  Code,
  Blockquote,
  ThematicBreak,
  Image,
  Link,
  Text,
  Strong,
  Emphasis,
  Delete,
  InlineCode,
  Table,
  TableRow,
  TableCell,
} from 'mdast';

interface NotionRichText {
  type: 'text' | 'mention' | 'equation';
  text?: { content: string; link?: { url: string } };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
}

interface NotionBlock {
  object: 'block';
  type: string;
  [key: string]: any;
}

function buildRichTextFromChildren(children: any[]): NotionRichText[] {
  const results: NotionRichText[] = [];

  function walk(n: any, annotations: NotionRichText['annotations'] = {}) {
    if (n.type === 'text') {
      results.push({
        type: 'text',
        text: { content: n.value || '' },
        annotations: { ...annotations },
      });
    } else if (n.type === 'inlineCode') {
      results.push({
        type: 'text',
        text: { content: n.value || '' },
        annotations: { ...annotations, code: true },
      });
    } else if (n.type === 'strong') {
      for (const child of n.children || []) {
        walk(child, { ...annotations, bold: true });
      }
    } else if (n.type === 'emphasis') {
      for (const child of n.children || []) {
        walk(child, { ...annotations, italic: true });
      }
    } else if (n.type === 'delete') {
      for (const child of n.children || []) {
        walk(child, { ...annotations, strikethrough: true });
      }
    } else if (n.type === 'link') {
      const collected: NotionRichText[] = [];
      function collectInner(child: any, ann: NotionRichText['annotations']) {
        if (child.type === 'text') {
          collected.push({ type: 'text', text: { content: child.value || '', link: { url: n.url || '' } }, annotations: { ...ann } });
        } else if (child.type === 'strong') {
          for (const c of child.children || []) collectInner(c, { ...ann, bold: true });
        } else if (child.type === 'emphasis') {
          for (const c of child.children || []) collectInner(c, { ...ann, italic: true });
        } else if (child.type === 'delete') {
          for (const c of child.children || []) collectInner(c, { ...ann, strikethrough: true });
        } else if (child.type === 'inlineCode') {
          collected.push({ type: 'text', text: { content: child.value || '', link: { url: n.url || '' } }, annotations: { ...ann, code: true } });
        } else if (child.children) {
          for (const c of child.children) collectInner(c, ann);
        }
      }
      for (const child of n.children || []) {
        collectInner(child, annotations);
      }
      results.push(...collected);
    } else if (n.children) {
      for (const child of n.children) {
        walk(child, annotations);
      }
    }
  }

  for (const child of children) {
    walk(child);
  }
  return results.length > 0 ? results : [{ type: 'text', text: { content: '' } }];
}

function isTaskItem(item: ListItem): boolean {
  return typeof (item as any).checked === 'boolean';
}

function extractFirstLineText(item: ListItem): NotionRichText[] {
  const content = item.children || [];
  const first = content.find(c => c.type === 'paragraph' || c.type === 'heading') || content[0];
  if (first && 'children' in first) {
    return buildRichTextFromChildren((first as any).children || []);
  }
  return [{ type: 'text', text: { content: '' } }];
}

function processListItems(list: List): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const ordered = list.ordered || false;

  for (const item of list.children as ListItem[]) {
    const richText = extractFirstLineText(item);
    const checked = (item as any).checked;

    let block: NotionBlock;
    if (typeof checked === 'boolean') {
      block = {
        object: 'block',
        type: 'to_do',
        to_do: { rich_text: richText, checked },
      };
    } else if (ordered) {
      block = {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: richText },
      };
    } else {
      block = {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: richText },
      };
    }

    const content = item.children || [];
    const subBlocks: NotionBlock[] = [];
    for (const child of content) {
      if (child.type === 'list') {
        const nested = processListItems(child as List);
        subBlocks.push(...nested);
      } else if (child.type !== 'paragraph') {
        const text = 'value' in child ? (child as any).value : '';
        if (text) {
          subBlocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: text } }] },
          });
        }
      }
    }
    if (subBlocks.length > 0) {
      block.children = subBlocks;
    }

    blocks.push(block);
  }

  return blocks;
}

function processTable(node: Table): NotionBlock {
  const rows = node.children as TableRow[];
  const hasBody = rows.length > 1 || (rows.length === 1 && !rows[0].children?.length);

  const headerRow = rows[0];
  const headerCells = headerRow ? (headerRow.children as TableCell[]).map(c => buildRichTextFromChildren(c.children || [])) : [];
  const columnCount = headerCells.length || 1;

  const children: any[] = [];

  if (headerRow && headerCells.length > 0) {
    const paddedHeader = padRow(headerCells, columnCount);
    children.push({
      type: 'table_row',
      table_row: { cells: paddedHeader },
    });
  }

  for (let i = 1; i < rows.length; i++) {
    const cells = (rows[i].children as TableCell[]).map(c => buildRichTextFromChildren(c.children || []));
    const padded = padRow(cells, columnCount);
    children.push({
      type: 'table_row',
      table_row: { cells: padded },
    });
  }

  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: columnCount,
      has_column_header: headerCells.length > 0,
      has_row_header: false,
    },
    children,
  };
}

function padRow(cells: any[][], count: number): any[][] {
  const padded = [...cells];
  while (padded.length < count) {
    padded.push([{ type: 'text' as const, text: { content: '' } }]);
  }
  return padded;
}

export async function markdownToBlocks(markdown: string): Promise<NotionBlock[]> {
  const parser = unified()
    .use(remarkParse)
    .use(remarkGfm);

  const ast = parser.parse(markdown) as Root;
  const blocks: NotionBlock[] = [];

  for (const node of ast.children) {
    switch (node.type) {
      case 'heading': {
        const h = node as Heading;
        const level = Math.min(3, Math.max(1, h.depth));
        const richText = buildRichTextFromChildren(h.children || []);
        blocks.push({
          object: 'block',
          type: `heading_${level}`,
          [`heading_${level}`]: { rich_text: richText },
        });
        break;
      }

      case 'paragraph': {
        const p = node as Paragraph;
        const richText = buildRichTextFromChildren(p.children || []);
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: richText },
        });
        break;
      }

      case 'list': {
        const listBlocks = processListItems(node as List);
        blocks.push(...listBlocks);
        break;
      }

      case 'code': {
        const c = node as Code;
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: c.value || '' } }],
            language: c.lang || 'plain text',
          },
        });
        break;
      }

      case 'blockquote': {
        const bq = node as Blockquote;
        const children = bq.children || [];

        const texts: string[] = [];
        for (const child of children) {
          if ('children' in child) {
            const inner = buildRichTextFromChildren((child as any).children || []);
            const joined = inner.map(r => r.text?.content || '').join('');
            texts.push(joined);
          }
        }

        blocks.push({
          object: 'block',
          type: 'quote',
          quote: { rich_text: [{ type: 'text', text: { content: texts.join('\n\n') } }] },
        });
        break;
      }

      case 'thematicBreak': {
        blocks.push({
          object: 'block',
          type: 'divider',
          divider: {},
        });
        break;
      }

      case 'image': {
        const img = node as Image;
        blocks.push({
          object: 'block',
          type: 'image',
          image: {
            type: 'external',
            external: { url: img.url || '' },
            caption: img.alt ? [{ type: 'text', text: { content: img.alt } }] : [],
          },
        });
        break;
      }

      case 'table': {
        const tableBlock = processTable(node as Table);
        blocks.push(tableBlock);
        break;
      }

      default:
        if ((node as any).value) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: (node as any).value } }] },
          });
        }
    }
  }

  return blocks;
}
