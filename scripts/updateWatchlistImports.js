#!/usr/bin/env node

/**
 * Migration Script: Update Firebase Watchlist Imports
 * 
 * This script automatically updates all Firebase watchlist imports to use the smart service
 * 
 * Usage:
 * node scripts/updateWatchlistImports.js
 * 
 * What it does:
 * 1. Finds all files with Firebase watchlist imports
 * 2. Replaces them with smart service imports
 * 3. Creates backup files (.backup) before making changes
 * 4. Provides a summary of changes made
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import mappings: Firebase path -> Smart service import
const IMPORT_MAPPINGS = {
  '@/app/firebase/WatchList/WatchListDocument/GetLoggedUserWatchListsInfo': 'GetLoggedUserWatchListsInfo',
  '@/app/firebase/WatchList/CreateWatchList': 'CreateWatchList',
  '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById': 'GetWatchListDataById',
  '@/app/firebase/WatchList/DeleteWatchList': 'DeleteWatchListById',
  '@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList': 'AddAnimeToWatchList',
  '@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList': 'RemoveAnimeFromWatchList',
  '@/app/firebase/WatchList/UpdateWatchLists/ChangeWatchListName': 'ChangeWatchListName',
  '@/app/firebase/WatchList/UpdateWatchLists/UpdatePublicPrivateWatchList': 'UpdatePublicPrivateWatchList',
  '@/app/firebase/WatchList/WatchListDocument/GetWatchListInfoById': 'GetWatchListInfoById',
  '@/app/firebase/WatchList/WatchListDocument/GetOtherUserWatchListsInfo': 'GetOtherUserWatchListsInfo'
};

// Files to exclude from migration
const EXCLUDE_FILES = [
  'src/ZustandStores/userStore.js',
  'src/services/hybrid/watchlistService.js',
  'src/services/smart/watchlistService.js',
  'src/services/cloudflare/watchlist.js'
];

class ImportMigrator {
  constructor() {
    this.changedFiles = [];
    this.errors = [];
  }

  /**
   * Find all files that need migration
   */
  findFilesToMigrate() {
    const patterns = [
      'src/**/*.js',
      'src/**/*.jsx',
      'src/**/*.ts',
      'src/**/*.tsx'
    ];

    let allFiles = [];
    patterns.forEach(pattern => {
      const files = glob.sync(pattern);
      allFiles = allFiles.concat(files);
    });

    // Remove duplicates and excluded files
    const uniqueFiles = [...new Set(allFiles)];
    return uniqueFiles.filter(file => !EXCLUDE_FILES.includes(file));
  }

  /**
   * Check if file contains Firebase watchlist imports
   */
  hasFirebaseWatchlistImports(content) {
    const firebasePaths = Object.keys(IMPORT_MAPPINGS);
    return firebasePaths.some(path => content.includes(path));
  }

  /**
   * Update imports in file content
   */
  updateImports(content, filePath) {
    let updatedContent = content;
    const importedFunctions = [];

    // Find and replace each Firebase import
    Object.entries(IMPORT_MAPPINGS).forEach(([firebasePath, functionName]) => {
      // Pattern for default imports: import FunctionName from "path"
      const defaultImportRegex = new RegExp(
        `import\\s+${functionName}\\s+from\\s+["']${firebasePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'];?`,
        'g'
      );

      if (defaultImportRegex.test(updatedContent)) {
        importedFunctions.push(functionName);
        // Remove the Firebase import
        updatedContent = updatedContent.replace(defaultImportRegex, '');
      }
    });

    // If we found Firebase imports, add the smart service import
    if (importedFunctions.length > 0) {
      const smartImport = `import { ${importedFunctions.join(', ')} } from '@/services/smart/watchlistService';`;
      
      // Find the best place to insert the import (after other imports)
      const lines = updatedContent.split('\n');
      let insertIndex = 0;
      
      // Find the last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') && !lines[i].includes('@/services/smart/watchlistService')) {
          insertIndex = i + 1;
        }
      }
      
      // Insert the smart import
      lines.splice(insertIndex, 0, smartImport);
      updatedContent = lines.join('\n');
      
      // Clean up extra empty lines
      updatedContent = updatedContent.replace(/\n\n\n+/g, '\n\n');
    }

    return { updatedContent, importedFunctions };
  }

  /**
   * Create backup of original file
   */
  createBackup(filePath) {
    const backupPath = `${filePath}.backup`;
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
  }

  /**
   * Migrate a single file
   */
  migrateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!this.hasFirebaseWatchlistImports(content)) {
        return false; // No changes needed
      }

      const { updatedContent, importedFunctions } = this.updateImports(content, filePath);
      
      if (importedFunctions.length === 0) {
        return false; // No changes made
      }

      // Create backup
      this.createBackup(filePath);
      
      // Write updated content
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      this.changedFiles.push({
        file: filePath,
        functions: importedFunctions
      });
      
      return true;
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Run the migration
   */
  async migrate() {
    console.log('🚀 Starting Firebase Watchlist Import Migration...\n');
    
    const filesToCheck = this.findFilesToMigrate();
    console.log(`📁 Found ${filesToCheck.length} files to check\n`);
    
    let migratedCount = 0;
    
    for (const filePath of filesToCheck) {
      const wasMigrated = this.migrateFile(filePath);
      if (wasMigrated) {
        migratedCount++;
        console.log(`✅ Migrated: ${filePath}`);
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Files checked: ${filesToCheck.length}`);
    console.log(`   Files migrated: ${migratedCount}`);
    console.log(`   Errors: ${this.errors.length}`);
    
    if (this.changedFiles.length > 0) {
      console.log(`\n📝 Changed Files:`);
      this.changedFiles.forEach(({ file, functions }) => {
        console.log(`   ${file}`);
        console.log(`     Functions: ${functions.join(', ')}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    
    if (migratedCount > 0) {
      console.log(`\n🎉 Migration completed successfully!`);
      console.log(`\n📋 Next Steps:`);
      console.log(`   1. Review the changes in your files`);
      console.log(`   2. Test your application thoroughly`);
      console.log(`   3. Set NEXT_PUBLIC_MIGRATION_MODE=hybrid when ready`);
      console.log(`   4. Remove .backup files when satisfied with changes`);
      console.log(`\n💡 To rollback: rename .backup files back to original names`);
    } else {
      console.log(`\n✨ No files needed migration - you're all set!`);
    }
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  const migrator = new ImportMigrator();
  migrator.migrate().catch(console.error);
}

module.exports = ImportMigrator;