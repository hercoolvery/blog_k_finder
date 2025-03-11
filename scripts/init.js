const fs = require('fs');
const path = require('path');

function cleanDirectory(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Directory ${dir} initialized successfully`);
    return true;
  } catch (error) {
    console.warn(`Warning: Could not fully initialize ${dir}: ${error.message}`);
    return false;
  }
}

function ensureNextjsDirectories() {
  const projectRoot = process.cwd();
  const directories = [
    path.join(projectRoot, '.next'),
    path.join(projectRoot, '.next', 'cache'),
    path.join(projectRoot, 'node_modules', '.cache')
  ];

  let success = true;
  directories.forEach(dir => {
    if (!cleanDirectory(dir)) {
      success = false;
    }
  });

  if (success) {
    console.log('✓ All directories initialized successfully');
  } else {
    console.log('⚠ Some directories could not be fully initialized, but we can continue');
  }

  return true;
}

// 스크립트 실행
ensureNextjsDirectories(); 