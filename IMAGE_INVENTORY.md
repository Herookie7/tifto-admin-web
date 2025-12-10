# Image Inventory for Tifto Admin Web App

This document lists all images used in the tifto-admin web application, including local files and external URLs.

## Local Image Files

### Favicon
- `/public/favicon.png` - Main favicon used in app metadata
- `/app/(localized)/favicon.ico` - Alternative favicon file

### Logo Images
- `/public/assets/images/png/logo.png` - PNG version of the logo
- `/public/assets/images/svgs/logo.svg` - SVG version of the logo
- `/public/assets/images/svgs/logo copy.svg` - Duplicate SVG logo file....

### SVG Components (Rendered as Inline SVG)
- `/lib/utils/assets/svgs/logo.tsx` - AppLogo component (inline SVG)
- `/lib/utils/assets/svgs/Car.tsx` - Car icon SVG component
- `/lib/utils/assets/svgs/circle.tsx` - Circle icon SVG component
- `/lib/utils/assets/svgs/Frame.tsx` - Frame icon SVG component
- `/lib/utils/assets/svgs/point-line.tsx` - Point line SVG component
- `/lib/utils/assets/svgs/polygon.tsx` - Polygon SVG component
- `/lib/utils/assets/svgs/profile.tsx` - Profile icon SVG component
- `/lib/utils/assets/svgs/record.tsx` - Record icon SVG component
- `/lib/utils/assets/svgs/stripe.tsx` - Stripe icon SVG component

## External Image URLs Used in Code

### Placeholder Images
1. **Portrait Placeholder** (used in multiple components)
   - `https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png`
   - Used in:
     - `/lib/ui/useable-components/vendor-card/index.tsx` (line 163)
     - `/lib/ui/useable-components/user-ticket-card/index.tsx` (line 91)
     - `/lib/ui/useable-components/chat-message/index.tsx` (line 27)
     - `/lib/ui/screen-components/protected/layout/super-admin-layout/app-bar/index.tsx` (line 366)
     - `/lib/ui/screen-components/protected/layout/vendor-layout/app-bar/index.tsx` (line 228)
     - `/lib/ui/screen-components/protected/layout/restaurant-layout/app-bar/index.tsx` (lines 236, 275)
     - `/lib/ui/screen-components/protected/super-admin/user-detail/user-card.tsx` (line 15)

2. **Restaurant Placeholder**
   - `https://t4.ftcdn.net/jpg/04/76/57/27/240_F_476572792_zMwqHpmGal1fzh0tDJ3onkLo88IjgNbL.jpg`
   - Used in:
     - `/lib/ui/screen-components/protected/vendor/restaurants/add-form/restaurant-details.tsx` (line 74)
     - `/lib/ui/screen-components/protected/super-admin/vendor/form/restaurant-add-form/restaurant-details.tsx` (line 82)
     - `/lib/ui/screen-components/protected/super-admin/restaurants/add-form/restaurant-details.tsx` (line 74)

3. **Cloudinary Logo**
   - `https://res.cloudinary.com/dc6xw0lzg/image/upload/v1735894342/dvi5fjbsgdlrzwip0whg.jpg`
   - Used in:
     - `/lib/ui/screen-components/protected/vendor/restaurants/add-form/restaurant-details.tsx` (line 75)
     - `/lib/ui/screen-components/protected/super-admin/vendor/form/restaurant-add-form/restaurant-details.tsx` (line 83)
     - `/lib/ui/screen-components/protected/super-admin/restaurants/add-form/restaurant-details.tsx` (line 75)

4. **Cuisine Placeholder**
   - `https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`
   - Used in:
     - `/lib/ui/useable-components/table/columns/cuisine-columns.tsx` (line 32)

5. **License Plate Placeholder**
   - `https://static.vecteezy.com/system/resources/previews/031/602/489/large_2x/blank-license-plate-icon-design-templates-free-vector.jpg`
   - Used in:
     - `/lib/ui/screen-components/protected/super-admin/riders/view/cards/vehicle-details/index.tsx` (line 49)

6. **Driver's License Placeholder**
   - `https://static.vecteezy.com/system/resources/previews/003/415/255/non_2x/drivers-license-a-plastic-identity-card-outline-vector.jpg`
   - Used in:
     - `/lib/ui/screen-components/protected/super-admin/riders/view/cards/license-details/index.tsx` (line 61)

7. **Firebase Notification Icon**
   - `https://e7.pngegg.com/pngimages/875/651/png-clipart-background-brush-texture-brush-black.png`
   - Used in:
     - `/public/firebase-messaging-sw.js` (line 33)

### Dummy/Test Image URLs
1. **Restaurant Images** (dummy data)
   - `/images/restaurant1.jpg`, `/images/restaurant2.jpg`, etc.
   - Used in:
     - `/lib/utils/dummy/index.tsx` (line 139)

2. **Banner Images** (dummy data)
   - `https://example.com/banner1.jpg`, `https://example.com/banner2.jpg`, etc.
   - Used in:
     - `/lib/utils/dummy/index.tsx` (line 329)

## Image References in Code

### Referenced but May Not Exist
- `/logo.png` - Referenced in `/lib/ui/useable-components/chat-message/index.tsx` (line 50)
  - Note: Actual logo file is at `/public/assets/images/png/logo.png`

### Dynamic Images
Images are also loaded dynamically from:
- User avatars (from API/data)
- Restaurant images (from API/data)
- Food item images (from API/data)
- Category images (from API/data)
- Cuisine images (from API/data)
- Banner images (from API/data)

These are referenced in components like:
- `/lib/ui/useable-components/table/columns/foods-columns.tsx` - `item.image`
- `/lib/ui/useable-components/table/columns/category-columns.tsx` - `item.image`

## Summary

**Total Local Image Files:** 5 files
- 1 favicon (PNG)
- 1 favicon (ICO)
- 1 logo (PNG)
- 2 logos (SVG)

**Total SVG Components:** 9 files
- All located in `/lib/utils/assets/svgs/`

**External Image URLs:** 8 unique placeholder URLs (used across multiple files)

**Note:** The app also supports dynamic image loading from Cloudinary and other configured domains as specified in `next.config.mjs`.

