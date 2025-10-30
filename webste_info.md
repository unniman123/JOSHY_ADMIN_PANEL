Of course. Here are the answers to your questions, based on the current structure and implementation of the website frontend.

### 2) Frontend Integration Details

*   **Frontend Base URL(s) and Environment:**
    *   The base URL for production or staging is not defined within the codebase. This is typically configured in the deployment environment (e.g., Netlify, Vercel).
    *   For local development, the frontend runs on a standard Vite development server, likely `http://localhost:5173`.
    *   CORS policies will need to be configured on your Supabase backend to allow requests from the domain(s) where the frontend will be deployed.

*   **Auth Approach Used by Website Frontend:**
    *   The website is a public-facing application and **does not have its own user authentication or session model** for viewing content.
    *   It is designed to display read-only published content. The ideal and expected approach would be to use the **Supabase `anon` key** in the frontend to query public data.

*   **Endpoints Currently Consumed by Website:**
    The website does not consume real HTTP endpoints yet. Instead, it uses async functions that mimic API calls. Your Supabase API should be designed to provide data for these functions, which are the primary integration points:
    *   **`getAllTours(filters?)`**: Used in `src/pages/Tours.tsx` to fetch the list of all tours. The admin panel should provide an endpoint that returns all published tours, ideally with filtering capabilities.
    *   **`getTourBySlug(slug)`**: Used in `src/pages/TourDetail.tsx` to fetch the complete data for a single tour.
    *   **`getToursByCategoryAndSubcategory(category, subcategory?)`**: Used in `src/pages/DynamicCategoryPage.tsx` to display tours for a specific category.
    *   **`getRelatedTours(slug)`**: Used on the tour detail page to show similar tours. The logic for what is "related" will need to be implemented in the backend (e.g., tours in the same category).
    *   **`unifiedSearch(query)`**: Used by the main search bar in `src/components/HeroBanner.tsx`. The backend will need to provide a search endpoint that can query across both tours and destinations.

### 3) Data Mapping and Field Expectations

*   **Tour Card Component:**
    Yes, your assessment is correct. Based on the `TourSummary` interface in `src/lib/api.ts` and its usage in `src/components/ToursGrid.tsx`, a tour card expects the following fields:
    *   `id` (string)
    *   `title` (string)
    *   `slug` (string)
    *   `description` (string, used as `short_description`)
    *   `image` (string, used as `featured_image_url`)
    *   `price` (string, e.g., "₹65,000")
    *   `duration` (number, used as `duration_days`)
    *   `category` or `categories` (string or array of strings)

*   **Tour Detail Page:**
    The tour detail page (`src/pages/TourDetail.tsx`) uses the full `Tour` interface from `src/lib/api.ts`. It expects a nested structure:
    *   **`overview`**: The frontend currently expects a simple **string of text or HTML**. The `getOverviewContent` utility in `src/lib/admin-utils.ts` retrieves this from `tour.sections` if available, falling back to `tour.detailedContent`. It does *not* use a JSONB renderer.
    *   **`images`**: The frontend is designed to consume an array of image objects from the `tour.images` field, where each object has a `section` property. It does **not** read from a single `image_gallery_urls` JSONB field. Your recommendation to use the `tour_images` table is the correct approach.
    *   **`itinerary`**: The frontend is built to handle a structured itinerary via the `tour.itineraryDays` array of objects. It also has a fallback parser (`parseLegacyItinerary` in `src/lib/admin-utils.ts`) to handle a simple string-based itinerary. Providing a structured JSON array is the preferred method.
    *   **Other fields:** `price` (string), `duration` (number), `location` (object with `lat`/`lng`), `rating` and `review_count` (these fields are not currently in the `Tour` interface but can be easily added and displayed).

*   **For Site Content:**
    The website's homepage sections (Hero Banner, Tour Offers) currently use hardcoded default props or receive props directly. The `HomepageAdminConfig` interface in `src/lib/admin-utils.ts` strongly suggests that a **single-row `homepage_settings` table** is the more canonical and expected approach for managing this content, rather than a key-value `site_content` table.

### 4) Content Rendering & Editor Integration

*   **Rich Text Format:**
    The website **does not use a JSON-based rich text editor or renderer** like Slate.js or TipTap. The components currently render content directly from strings. If the admin panel uses a JSON-based editor, a corresponding renderer component (e.g., a component that maps Slate.js nodes to HTML tags) would need to be added to the website frontend to ensure compatibility.

*   **Image Transformation:**
    The frontend has a basic utility (`buildSrcSet` in `src/lib/image-utils.ts`) that can build a `srcset` by appending width suffixes to an image URL (e.g., `image-800w.webp`). However, it does not implement any logic for complex URL query parameters (`?width=800`). The simplest integration would be for the backend to provide URLs for pre-transformed images if needed, or the frontend can be adapted to use Supabase's image transformation query params.

*   **Gallery Ordering:**
    The frontend expects ordering via a numeric `order` field on each image object, as seen in the `TourImage` interface and the sorting logic in `getImagesBySection`. Using `tour_images.display_order` is the correct approach.

### 5) Interaction & Flows

*   **Creation Flow for New Tours:**
    From a backend and data integrity perspective, the **server-first approach is highly recommended.** Create a draft tour via an API call to get a `tour_id` first. Then, upload images and associate them with that `tour_id`. This prevents orphaned images and makes the process more transactional and reliable.

*   **Slug Generation Rules:**
    Yes, generating a slug from the title (ASCII lowercase, strip non-alphanumerics) is a standard and acceptable practice. To prevent issues, the admin panel's "Save" or "Publish" function should include an **API check to ensure the generated slug is unique** before committing the change to the database.

*   **Publishing Workflow:**
    The frontend does not have a built-in caching layer. However, if you plan to use a CDN or server-side caching (like Vercel/Netlify cache) for performance, then yes, the publishing workflow in your admin panel **should trigger a cache invalidation or a webhook to purge the relevant CDN paths.** This ensures content updates are reflected immediately.

### 6) Assets & File Path Conventions

*   **Storage Path Pattern:**
    Your recommended storage path pattern is excellent and follows best practices. Using `tour-images/{tour-id}/{filename}` is the ideal way to organize assets and prevent conflicts.

*   **Max File Size and Allowed MIME Types:**
    The current website frontend does not have any file upload components, so it does not enforce these limits. The limits you mentioned (10MB and `image/*`) are very reasonable defaults to enforce in the admin panel's image upload components.

### 7) Analytics & SEO Fields

*   The `Tour` interface in `src/lib/api.ts` already includes fields for `seoTitle`, `seoDescription`, and `seoKeywords`.
*   However, the `TourDetail` page currently uses the main `tour.title` and `tour.description` for the page's metadata.
*   **Recommendation:** The frontend should be updated to prioritize the dedicated SEO fields. The logic should be: use `tour.seoTitle` if it exists, otherwise fall back to `tour.title`. This allows the admin panel to either auto-populate these fields from the main title/description or allow for custom, SEO-optimized overrides.


2. Frontend Mapping Choices (Final Confirmation)
Images: The frontend will read images from the tour_images table, categorized by the section field. — OK
Publish Flag: The canonical publishing flag is the boolean field is_published. — OK
Rich Text: The admin panel should send clean HTML strings, as this is what the frontend currently expects. — OK


Of course. Here are the details on rich-text rendering and field mappings.

### Rich-Text Format / Renderer

*   **Current Expectation:** The website expects **plain HTML strings**.
*   **Implementation Details:**
    *   There is no JSON-based rich text renderer (like Slate.js or TipTap) currently integrated into the website.
    *   Components that display rich content, such as `src/components/OverviewSection.tsx`, take a string prop and render it. While not explicitly using `dangerouslySetInnerHTML` in the `OverviewSection` itself, the content from `tour.detailedContent` in the mock data contains line breaks that are rendered as such, implying the content is expected to be pre-formatted.
    *   **Recommendation:** For the initial integration, providing clean HTML from the admin panel's rich text editor is the most direct path. If you want to move to a JSON-based format like TipTap in the future, a renderer component would need to be added to the website project to translate the JSON into HTML.

### Field Name Mappings & Expectations

*   **Featured Image (`featured_image_url` vs `featured_image`):**
    *   **Confirmation:** The frontend's `TourSummary` interface expects a field named **`image`** which contains a string URL for the tour's primary card/featured image.
    *   **Integration Note:** Your admin panel's `featured_image_url` field should be mapped to the `image` field in the API response sent to the frontend.

*   **Publishing Status (`is_published` vs `status='published'`):**
    *   **Confirmation:** The frontend's `Tour` interface already defines a boolean field **`isPublished`**. To maintain consistency with the existing code structure, `is_published` should be the canonical field in the database.
    *   **API Expectation:** The frontend will expect the API to only return tours where `is_published` is `true` for all public-facing queries (like `getAllTours`). An endpoint like `/api/tours?published=true` that filters on this boolean flag would be the expected implementation.

*   **SEO Field Preference (`seoTitle`/`seoDescription`):**
    *   **Confirmation:** The `Tour` interface includes optional fields for `seoTitle`, `seoDescription`, and `seoKeywords`. However, the tour detail page currently uses the main `tour.title` and `tour.description` for the SEO meta tags.
    *   **Recommendation:** The frontend should be updated to use the dedicated SEO fields when they are available. The logic should be:
        *   For the `<title>` tag: Use `tour.seoTitle` if it exists, otherwise fall back to `tour.title`.
        *   For the meta description: Use `tour.seoDescription` if it exists, otherwise fall back to `tour.description`.
    *   This allows the admin panel to provide SEO-specific overrides while ensuring there are always sensible defaults.