# <img src="icons/eye-open.svg" alt="Open Eye" width="32" height="32" style="vertical-align: text-bottom;"> TrueSight Browser Extension

Fully vibe coded.

TrueSight is a browser extension that toggles the visibility of GOV.UK accessibility elements (elements with the `govuk-visually-hidden` class) to help developers and designers understand what screen readers and other assistive technologies experience on a page.

## Features

- **Tab-specific toggle**: Each browser tab maintains its own visibility state independently
- **Visual indicators**: Extension icon changes between open eye (revealing hidden elements) and closed eye (normal view)
- **Lilac highlighting**: Revealed elements are highlighted with a subtle lilac background (`#e6d7ff`)
- **Dynamic detection**: Automatically detects and reveals hidden elements added to the page after initial load
- **One-click activation**: Simply click the extension icon to toggle visibility - no popup required

## Installation (Developer Mode)

### Chrome, Edge, Brave, and other Chromium-based browsers:

1. **Download or clone this repository** to your local machine

2. **Open your browser's extensions page**:
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`
   - Brave: Navigate to `brave://extensions/`
   - Other Chromium browsers: Usually `[browser]://extensions/`

3. **Enable Developer Mode**:
   - Look for a "Developer mode" toggle switch (usually in the top-right corner)
   - Turn it **ON**

4. **Load the extension**:
   - Click the **"Load unpacked"** button
   - Navigate to and select the TrueSight folder (the one containing `manifest.json`)
   - Click **"Select Folder"** or **"Open"**

5. **Verify installation**:
   - The TrueSight extension should now appear in your extensions list
   - You should see the closed eye icon in your browser toolbar
   - If the icon doesn't appear in the toolbar, click the puzzle piece icon and pin TrueSight

## Usage

1. **Navigate to a GOV.UK website** (or any site that uses `govuk-visually-hidden` class)

2. **Click the TrueSight extension icon** in your browser toolbar:
   - **Closed eye icon**: Hidden elements are not revealed (default state)
   - **Open eye icon**: Hidden elements are revealed with lilac highlighting

3. **Toggle between states** by clicking the icon again

4. **Switch tabs**: Each tab maintains its own toggle state independently

## What it reveals

TrueSight specifically targets elements with the `govuk-visually-hidden` CSS class, which is commonly used in GOV.UK services to provide content that is:

- Accessible to screen readers and assistive technologies
- Visually hidden from sighted users
- Important for accessibility compliance

Examples include:
- Skip links
- Form labels and hints
- Status messages
- Additional context for interactive elements

## Technical Details

- **Manifest Version**: 3
- **Permissions**: 
  - `activeTab`: Only accesses the current tab when clicked
  - `scripting`: Injects content script on-demand
  - `storage`: Maintains per-tab state
- **Icon states**: Dynamic icon switching based on toggle state
- **Cross-page persistence**: State maintained during navigation within the same tab

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `background.js`: Service worker handling icon clicks and state management
- `content.js`: Injected script that modifies page elements
- `icons/`: SVG source files and generated PNG icons in multiple sizes

To modify the icons, edit the SVG files and regenerate PNGs using:
```bash
rsvg-convert eye-closed.svg -w [size] -h [size] -o eye-closed-[size].png
rsvg-convert eye-open.svg -w [size] -h [size] -o eye-open-[size].png
```
