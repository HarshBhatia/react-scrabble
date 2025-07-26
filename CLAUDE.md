# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development Server**: `npm run dev` - Starts Vite development server on http://localhost:3000
- **Production Build**: `npm run build` - Builds optimized production bundle to `dist/` directory
- **Preview Build**: `npm run preview` - Serves production build locally for testing
- **TypeScript Compile**: `npm run compile` or `tsc` - Compiles TypeScript to JavaScript
- **No tests configured**: The project currently has a placeholder test script that outputs an error

## Architecture Overview

This is a basic React + TypeScript project for a Scrabble game application. The architecture is minimal and follows standard React patterns:

- **Entry Point**: `src/index.tsx` - Standard React 19 app initialization with StrictMode
- **Main Component**: `src/App.tsx` - Root application component with basic structure (header, main, footer)
- **Build Output**: TypeScript compiles to `dist/` directory
- **TypeScript Config**: Configured for ES6 modules, React JSX, and strict mode

## Key Technical Details

- **React Version**: 19.0.0 (latest)
- **TypeScript**: Strict mode enabled, compiles to ES6
- **Build Tool**: Vite 7.0.6 with React plugin for fast development and optimized builds
- **Module System**: ES6 modules (despite package.json showing "commonjs" type)
- **Build Target**: ES6, outputs to `dist/` directory
- **Styling**: Basic CSS with `src/App.css` for component styles
- **No Testing Framework**: Tests need to be set up from scratch

## Project Structure

The codebase is currently a skeleton with minimal implementation:
- `src/App.tsx` contains placeholder content for a Scrabble game
- No game logic, components, or styling implemented yet
- Public directory exists but is empty
- Missing CSS files that are referenced in components

## Development Notes

- The project uses both npm and yarn (both lock files present)
- Vite configuration in `vite.config.ts` for development server and build process
- HTML template in root directory (`index.html`) as required by Vite
- CSS styling implemented in `src/App.css` with basic component styles
- Development server runs on port 3000 with hot module replacement