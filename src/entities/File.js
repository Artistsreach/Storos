// Mock data for files and folders
let files = [
  { id: 1, name: 'Create', type: 'folder', parent_id: null, position_x: 50, position_y: 50 },
  { id: 2, name: 'Build', type: 'folder', parent_id: null, position_x: 50, position_y: 150 },
  { id: 3, name: 'Explore', type: 'folder', parent_id: null, position_x: 50, position_y: 250 },
  { id: 16, name: 'Automate', type: 'folder', parent_id: null, position_x: 150, position_y: 50 },
  { id: 17, name: 'Learn', type: 'folder', parent_id: null, position_x: 150, position_y: 150 },
  { id: 4, name: 'Video', type: 'file', parent_id: 1, icon: '🎥', url: 'https://studio.freshfront.co' },
  { id: 5, name: 'NFT', type: 'file', parent_id: 1, icon: '🖼️', url: 'https://nft.freshfront.co' },
  { id: 6, name: 'Product', type: 'file', parent_id: 1, icon: '📦', url: 'https://freshfront.co/designer' },
  { id: 7, name: 'Music', type: 'file', parent_id: 1, icon: 'https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Mmicon.png.png', url: 'https://musicmigo.com' },
  { id: 8, name: 'Podcast', type: 'file', parent_id: 1, icon: '🎙️', url: 'https://freshfront.co/podcast' },
  { id: 9, name: 'Store', type: 'file', parent_id: 2, icon: '🛍️', url: 'https://freshfront.co' },
  { id: 10, name: 'App', type: 'file', parent_id: 2, icon: '⚙️', url: 'https://build.freshfront.co' },
  { id: 11, name: 'Website', type: 'file', parent_id: 2, icon: '🌐', url: 'https://freshfront.co/page-generator' },
  { id: 12, name: 'Game (coming soon)', type: 'file', parent_id: 2, icon: '🎮' },
  { id: 13, name: 'Search Products', type: 'file', parent_id: 3, icon: '🔍', url: 'https://freshfront.co/search' },
  { id: 14, name: 'Enter Front St.', type: 'file', parent_id: 3, icon: '🏘️', url: '/play' },
  { id: 15, name: 'Commandr', type: 'file', parent_id: 16, icon: 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//IMG_1655.png', dark_icon: 'https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//IMG_1654.png', url: 'https://commandr.co' },
  { id: 18, name: 'Info', type: 'file', parent_id: 17, icon: 'ℹ️', url: '/info' },
  { id: 19, name: 'Store Creation', type: 'folder', parent_id: 17, icon: '🛍️' },
  { id: 112, name: 'Stripe Onboarding', type: 'file', parent_id: 17, icon: '💳' },
  { id: 20, name: 'Inventory', type: 'folder', parent_id: 19, icon: '📦' },
  { id: 21, name: 'Prompt', type: 'file', parent_id: 20, icon: '💡' },
  { id: 22, name: 'Step by Step', type: 'file', parent_id: 20, icon: '🗺️' },
  { id: 23, name: 'Import', type: 'file', parent_id: 20, icon: '📥' },
  { id: 24, name: 'Print on Demand', type: 'folder', parent_id: 19, icon: '👕' },
  { id: 25, name: 'Prompt', type: 'file', parent_id: 24, icon: '💡' },
  { id: 26, name: 'Step by Step', type: 'file', parent_id: 24, icon: '🗺️' },
  { id: 27, name: 'Import', type: 'file', parent_id: 24, icon: '📥' },
  { id: 28, name: 'Dropshipping', type: 'folder', parent_id: 19, icon: '📦' },
  { id: 29, name: 'Prompt', type: 'file', parent_id: 28, icon: '💡' },
  { id: 30, name: 'Step by Step', type: 'file', parent_id: 28, icon: '🗺️' },
  { id: 31, name: 'Import', type: 'file', parent_id: 28, icon: '📥' },
  { id: 32, name: 'Crowdfunding', type: 'folder', parent_id: 19, icon: '💸' },
  { id: 33, name: 'Prompt', type: 'file', parent_id: 32, icon: '💡' },
  { id: 34, name: 'Step by Step', type: 'file', parent_id: 32, icon: '🗺️' },
  { id: 35, name: 'Import', type: 'file', parent_id: 32, icon: '📥' },
  { id: 36, name: 'Prompt', type: 'file', parent_id: 19, icon: '💡' },
  { id: 37, name: 'Step by Step', type: 'file', parent_id: 19, icon: '🗺️' },
  { id: 38, name: 'Import', type: 'file', parent_id: 19, icon: '📥' },
  { id: 39, name: 'Edit Stores', type: 'file', parent_id: 19, icon: '🖌️' },
  { id: 40, name: 'Products', type: 'folder', parent_id: 17, icon: '📦' },
  { id: 41, name: 'Payments', type: 'folder', parent_id: 17, icon: '💳' },
  { id: 42, name: 'Profiles', type: 'folder', parent_id: 17, icon: '👤' },
  { id: 43, name: 'NFTs', type: 'folder', parent_id: 17, icon: '🖼️' },
  { id: 44, name: 'Vibe Coding', type: 'folder', parent_id: 17, icon: '💻' },
  { id: 45, name: 'Content Creation', type: 'folder', parent_id: 17, icon: '✍️' },
  { id: 46, name: 'AI Tools', type: 'folder', parent_id: 19, icon: '🤖' },
  { id: 47, name: 'Automation', type: 'folder', parent_id: 17, icon: '⚙️' },
  { id: 48, name: 'Marketing', type: 'folder', parent_id: 17, icon: '📈' },
  { id: 49, name: 'Checkout', type: 'file', parent_id: 41, icon: '🛒' },
  { id: 50, name: 'Orders', type: 'file', parent_id: 41, icon: '📋' },
  { id: 51, name: 'Payouts', type: 'file', parent_id: 41, icon: '💵' },
  { id: 52, name: 'Digital Storefront', type: 'file', parent_id: 43, icon: '🏪' },
  { id: 53, name: 'Mint Products', type: 'file', parent_id: 43, icon: '✨' },
  { id: 54, name: 'Avatar', type: 'file', parent_id: 43, icon: '👤' },
  { id: 55, name: 'Front St.', type: 'file', parent_id: 43, icon: '🏘️' },
  { id: 56, name: 'Prompting', type: 'file', parent_id: 44, icon: '💡' },
  { id: 57, name: 'Frameworks', type: 'folder', parent_id: 44, icon: '📚' },
  { id: 58, name: 'Next.js', type: 'file', parent_id: 57, icon: '▶️' },
  { id: 59, name: 'Vite', type: 'file', parent_id: 57, icon: '⚡' },
  { id: 60, name: 'Expo', type: 'file', parent_id: 57, icon: '📱' },
  { id: 61, name: 'Websites', type: 'file', parent_id: 44, icon: '🌐' },
  { id: 62, name: 'Mobile Apps', type: 'file', parent_id: 44, icon: '📱' },
  { id: 63, name: 'Publish', type: 'folder', parent_id: 44, icon: '🚀' },
  { id: 64, name: 'App Stores', type: 'file', parent_id: 63, icon: '🛒' },
  { id: 65, name: 'Web Hosting', type: 'file', parent_id: 63, icon: '☁️' },
  { id: 66, name: 'Tavus', type: 'file', parent_id: 45, icon: '🦜' },
  { id: 67, name: 'Generative AI', type: 'folder', parent_id: 45, icon: '🤖' },
  { id: 68, name: 'Automated Workflows', type: 'folder', parent_id: 45, icon: '⚙️' },
  { id: 69, name: 'Customization', type: 'file', parent_id: 42, icon: '🎨' },
  { id: 70, name: 'Posts', type: 'file', parent_id: 42, icon: '✍️' },
  { id: 71, name: 'Link Apps', type: 'file', parent_id: 42, icon: '🔗' },
  { id: 72, name: 'Link Products', type: 'file', parent_id: 42, icon: '🔗' },
  { id: 73, name: 'Shareable Link', type: 'file', parent_id: 42, icon: '🔗' },
  { id: 74, name: 'Import', type: 'file', parent_id: 40, icon: '📥' },
  { id: 75, name: 'POD Designer', type: 'file', parent_id: 40, icon: '👕' },
  { id: 76, name: 'Visualizer', type: 'file', parent_id: 40, icon: '👁️' },
  { id: 77, name: 'Variants', type: 'file', parent_id: 40, icon: '🎨' },
  { id: 78, name: 'Gallery Enhancer', type: 'file', parent_id: 40, icon: '✨' },
  { id: 79, name: 'Mockups', type: 'file', parent_id: 40, icon: '🖼️' },
  { id: 80, name: 'Generation', type: 'file', parent_id: 40, icon: '✨' },
  { id: 81, name: 'Edit', type: 'file', parent_id: 40, icon: '✏️' },
  { id: 82, name: 'Text to Audio', type: 'file', parent_id: 67, icon: '🔊' },
  { id: 83, name: 'Image', type: 'file', parent_id: 67, icon: '🖼️' },
  { id: 84, name: 'Image to Image', type: 'file', parent_id: 67, icon: '🖼️' },
  { id: 85, name: 'Text to Video', type: 'file', parent_id: 67, icon: '🎥' },
  { id: 86, name: 'Image to Video', type: 'file', parent_id: 67, icon: '🎥' },
  { id: 87, name: 'Video to Video', type: 'file', parent_id: 67, icon: '🎥' },
  { id: 88, name: 'Text to 3D', type: 'file', parent_id: 67, icon: '🧊' },
  { id: 89, name: 'Image to 3D', type: 'file', parent_id: 67, icon: '🧊' },
  { id: 90, name: 'Social Media Reel', type: 'file', parent_id: 68, icon: '📱' },
  { id: 91, name: 'YouTube Video', type: 'file', parent_id: 68, icon: '▶️' },
  { id: 92, name: 'Blog Post', type: 'file', parent_id: 68, icon: '✍️' },
  { id: 93, name: 'Product Page', type: 'file', parent_id: 68, icon: '🛍️' },
  { id: 94, name: 'Marketing Campaign', type: 'file', parent_id: 68, icon: '📈' },
  { id: 95, name: 'AI Assistant', type: 'folder', parent_id: 17, icon: '🤖' },
  { id: 96, name: 'Custom Instructions', type: 'file', parent_id: 95, icon: '📝' },
  { id: 97, name: 'Knowledge Base', type: 'file', parent_id: 95, icon: '📚' },
  { id: 98, name: 'Customer Personalization', type: 'file', parent_id: 95, icon: '👤' },
  { id: 99, name: 'Voice Mode', type: 'file', parent_id: 95, icon: '🗣️' },
  { id: 100, name: 'Product Recommendations', type: 'file', parent_id: 95, icon: '🛍️' },
  { id: 101, name: 'Email', type: 'file', parent_id: 48, icon: '📧' },
  { id: 102, name: 'Instagram', type: 'file', parent_id: 48, icon: '📸' },
  { id: 103, name: 'TikTok', type: 'file', parent_id: 48, icon: '🎵' },
  { id: 104, name: 'YouTube', type: 'file', parent_id: 48, icon: '▶️' },
  { id: 105, name: 'Google', type: 'folder', parent_id: 48, icon: '🇬' },
  { id: 106, name: 'Google Ads', type: 'file', parent_id: 105, icon: '📈' },
  { id: 107, name: 'Merchant Center', type: 'file', parent_id: 105, icon: '🛒' },
  { id: 108, name: 'My Business', type: 'file', parent_id: 105, icon: '🏢' },
  { id: 109, name: 'SEO', type: 'file', parent_id: 105, icon: '🔍' },
  { id: 110, name: 'Substack', type: 'file', parent_id: 48, icon: '📚' },
  { id: 111, name: 'X (Twitter)', type: 'file', parent_id: 48, icon: '🐦' },
  { id: 113, name: 'Social Media Content', type: 'file', parent_id: 16, icon: '📱' },
  { id: 114, name: 'Email Campaign', type: 'file', parent_id: 16, icon: '📧' },
  { id: 115, name: 'Product Design', type: 'file', parent_id: 16, icon: '🎨' },
  { id: 116, name: 'Store Creation', type: 'file', parent_id: 16, icon: '🛍️' },
  { id: 117, name: 'App Development', type: 'file', parent_id: 16, icon: '💻' },
  { id: 118, name: 'App Store Publishing', type: 'file', parent_id: 16, icon: '🚀' },
  { id: 119, name: 'Social Media Content', type: 'file', parent_id: 47, icon: '📱' },
  { id: 120, name: 'Email Campaign', type: 'file', parent_id: 47, icon: '📧' },
  { id: 121, name: 'Product Design', type: 'file', parent_id: 47, icon: '🎨' },
  { id: 122, name: 'Store Creation', type: 'file', parent_id: 47, icon: '🛍️' },
  { id: 123, name: 'App Development', type: 'file', parent_id: 47, icon: '💻' },
  { id: 124, name: 'App Store Publishing', type: 'file', parent_id: 47, icon: '🚀' },
];

let nextId = 125;

export class File {
  static async filter({ parent_id }) {
    if (parent_id === null) {
      return Promise.resolve(files.filter(file => file.parent_id === null || file.is_shortcut));
    }
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

  static async delete(id) {
    files = files.filter(file => file.id !== id);
    return Promise.resolve();
  }
}
