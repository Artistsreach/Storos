// Mock data for files and folders
let files = [
  { id: 1, name: 'Create', type: 'folder', parent_id: null, position_x: 50, position_y: 50 },
  { id: 2, name: 'Build', type: 'folder', parent_id: null, position_x: 50, position_y: 150 },
  { id: 3, name: 'Explore', type: 'folder', parent_id: null, position_x: 50, position_y: 250 },
  { id: 4, name: 'Video', type: 'file', parent_id: 1, icon: '🎥', url: 'https://studio.freshfront.co' },
  { id: 5, name: 'NFT', type: 'file', parent_id: 1, icon: '🖼️', url: 'https://nft.freshfront.co' },
  { id: 6, name: 'Product', type: 'file', parent_id: 1, icon: '📦', url: 'https://freshfront.co/designer' },
  { id: 7, name: 'Music', type: 'file', parent_id: 1, icon: '🎵', url: 'https://musicmigo.com' },
  { id: 8, name: 'Podcast', type: 'file', parent_id: 1, icon: '🎙️', url: 'https://freshfront.co/podcast' },
  { id: 9, name: 'Store', type: 'file', parent_id: 2, icon: '🛍️', url: 'https://freshfront.co' },
  { id: 10, name: 'App', type: 'file', parent_id: 2, icon: '⚙️', url: 'https://build.freshfront.co' },
  { id: 11, name: 'Website', type: 'file', parent_id: 2, icon: '🌐', url: 'https://freshfront.co/page-generator' },
  { id: 12, name: 'Game (coming soon)', type: 'file', parent_id: 2, icon: '🎮' },
  { id: 13, name: 'Search Products', type: 'file', parent_id: 3, icon: '🔍', url: 'https://freshfront.co/search' },
  { id: 14, name: 'Enter Front St.', type: 'file', parent_id: 3, icon: '🏘️', url: '/play' },
];

let nextId = 15;

export class File {
  static async filter({ parent_id }) {
    return Promise.resolve(files.filter(file => file.parent_id === parent_id));
  }

  static async getAll() {
    return Promise.resolve(files);
  }

  static async update(id, data) {
    const fileIndex = files.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      files[fileIndex] = { ...files[fileIndex], ...data };
    }
    return files[fileIndex];
  }

  static async create(data) {
    const newFile = { ...data, id: nextId++ };
    files.push(newFile);
    return Promise.resolve(newFile);
  }
}
