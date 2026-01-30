# VeloPDF

A comprehensive, client-side PDF manipulation tool built with React. Perform various PDF operations including merge, split, compress, convert, edit, and view PDFs—all in your browser with no signup required. **Your files never leave your device.**

## 🚀 Features

### Core Operations
- **Merge PDFs**: Combine multiple PDF files into a single document
- **Split & Extract**: Split large PDFs into smaller files or extract specific pages
- **Compress**: Reduce PDF file size while preserving quality and readability
- **Convert**: Convert PDFs to/from various formats:
  - PDF → PNG/JPG (images)
  - PDF → TXT (text extraction)
  - PDF → DOCX (Word documents - simplified)
  - Images/Text/Word → PDF
- **Edit & Annotate**: Full-featured in-browser PDF editor with:
  - Text editing (add, move, edit text with font controls)
  - Pen tool for freehand drawing
  - Image insertion
  - Page management (reorder, delete, rotate pages)
  - Find and replace functionality
  - Undo/redo support
- **View**: Fast in-browser PDF viewer
- **Secure**: Add passwords and permissions to PDFs

### Key Highlights
- ✅ **100% Client-Side**: All PDF processing happens entirely in your browser—no server, no uploads
- ✅ **No Signup Required**: Use all features without creating an account
- ✅ **Privacy-First**: Your files never leave your device
- ✅ **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **PDF.js** - PDF rendering and viewing
- **PDF-lib** - PDF manipulation and editing

## 📁 Project Structure

```
velopdf/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   └── utils/            # Utility functions
├── public/
├── package.json
└── vite.config.ts
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** 20+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd velopdf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Development

### Build for Production

```bash
npm run build
```

Output: `dist/`

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## 🚢 Deployment

The project includes a GitHub Actions workflow that deploys to GitHub Pages when changes are pushed to the `main` branch.

For Vercel or other static hosts, build with `npm run build` and deploy the `dist/` folder.

## 🙏 Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [PDF-lib](https://pdf-lib.js.org/) - PDF manipulation

---

**Made with ❤️ for easy PDF management**
