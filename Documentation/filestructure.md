reconciliation-helpr/
├── dist/                   # Contains compiled files - should be empty/non-existent in GH since it is in .gitignore
├── documentation/          # Project documentation
│   ├── filestructure.md   # This file - describes project organization
│   └── features.md        # Detailed feature documentation
├── node_modules/          # Node.js dependencies (auto-generated)
├── public/                # Static assets
│   └── index.html        # Main HTML entry point
├── src/                   # Source code
│   ├── components/       # React components
│   │   ├── AboutModal.js     # Information modal component
│   │   ├── ErrorBoundary.js  # Error handling wrapper
│   │   ├── FileUpload.js     # File upload interface
│   │   └── UsageNotice.js    # Usage instructions component
│   ├── styles/          # CSS styles
│   │   ├── base.css         # Global base styles
│   │   ├── error.css        # Error handling styles
│   │   ├── index.css        # Main style entry point
│   │   ├── layout.css       # Layout and grid styles
│   │   ├── modal.css        # Modal window styles
│   │   ├── notice.css       # Notice component styles
│   │   ├── reconciliation.css  # Main app styles
│   │   └── upload.css       # File upload styles
│   ├── utils/           # Utility functions
│   │   └── csvProcessor.js  # CSV parsing and processing
│   ├── App.js           # Main application component
│   └── index.js         # Application entry point
├── .babelrc             # Babel configuration
├── .gitignore          # Git ignore rules
├── package-lock.json   # Locked dependency versions
├── package.json        # Project configuration and dependencies
├── README.md          # Project overview and setup instructions
└── webpack.config.js  # Webpack build configuration