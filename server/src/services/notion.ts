import { Client } from '@notionhq/client';
import { decrypt } from './crypto.js';

export function createNotionClient(encryptedToken: string): Client {
  const token = decrypt(encryptedToken);
  return new Client({ auth: token });
}

export interface CreatePageParams {
  title: string;
  blocks: any[];
  databaseId?: string;
}

export async function createPage(
  notion: Client,
  { title, blocks, databaseId }: CreatePageParams
) {
  if (databaseId) {
    return notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: { title: [{ text: { content: title } }] },
      },
      children: blocks,
    });
  }
  throw new Error('databaseId is required to create a page. Create a Notion database first and pass its ID.');
}

export async function updatePageContent(
  notion: Client,
  pageId: string,
  blocks: any[]
) {
  const existingChildren = await notion.blocks.children.list({
    block_id: pageId,
  });
  const deletePromises = existingChildren.results.map((block: any) =>
    notion.blocks.delete({ block_id: block.id }).catch(() => {})
  );
  await Promise.all(deletePromises);
  await notion.blocks.children.append({
    block_id: pageId,
    children: blocks,
  });
}

export async function searchPages(
  notion: Client,
  query: string
) {
  const response = await notion.search({
    query,
    filter: { value: 'page', property: 'object' },
    sort: { direction: 'descending', timestamp: 'last_edited_time' },
    page_size: 20,
  });
  return response.results;
}

export async function listDatabases(notion: Client) {
  const response = await notion.search({
    filter: { value: 'database', property: 'object' },
    page_size: 50,
  });
  return response.results;
}
