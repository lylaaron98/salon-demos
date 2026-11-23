# Salon Booking Enquiry

WordPress plugin for the fictional Orrin Collective studios (Sable & Shear, Dewlab, Rootwell).
It covers the Elementor **Pro** features the sites would otherwise need, using free Elementor and
plain WordPress, on hosting with no outbound email (InfinityFree).

| Feature                             | Replaces                     | Where                                       |
| ----------------------------------- | ---------------------------- | ------------------------------------------- |
| Multi-step enquiry form widget      | Elementor Pro Form widget    | `src/Elementor/`                            |
| `[salon_enquiry]` shortcode + block | (for the Dewlab block theme) | `src/Frontend/Shortcodes.php`, `src/Block/` |
| Enquiries stored as a private CPT   | Form "email" action          | `src/PostType/EnquiryPostType.php`          |
| `sbe/v1/availability` REST route    | a booking SaaS               | `src/Rest/`, `src/Availability/`            |
| `sbe/v1/enquiry` REST route         | Form submission handler      | `src/Rest/`, `src/Enquiry/`                 |
| Promo modal                         | Elementor Pro Popups         | `src/Promo/`, `assets/js/promo.js`          |
| LocalBusiness + FAQPage JSON-LD     | an SEO plugin                | `src/Seo/JsonLd.php`                        |

Requirements: WordPress 6.5+, PHP 8.1+. Elementor (free) is optional; without it the shortcode
and block still work. No Composer at runtime: `src/Autoloader.php` is a PSR-4 autoloader for the
`SalonBookingEnquiry\` namespace.

## Install

Upload `salon-booking-enquiry/` to `wp-content/plugins/` (FTP or zip upload) and activate. Then:

- **Elementor:** drag _Salon enquiry form_ (category _Orrin Collective_) onto a page. Controls:
  brand, outlets, services (empty = all), heading, intro, button label, date/time step on/off,
  optional email field, analytics form ID, action colour (defaults to the kit's primary global).
- **Block editor:** insert the _Salon enquiry form_ block (same options in the sidebar).
- **Anywhere else:**
  `[salon_enquiry brand="sable" outlets="sable-tanjong-pagar,sable-tiong-bahru" services="sable-cut-finish" show_schedule="yes" ask_email="no" form_id="contact"]`
- **Settings > Salon enquiries:** site brand, JSON-LD on/off and business type, FAQ list, promo
  modal, rate limit, and whether uninstalling deletes stored enquiries.
- **Enquiries** (admin menu): list with reference, first name, mobile (tap to call or WhatsApp),
  outlet, service, preferred slot and marketing opt-in. Enquiries cannot be created by hand.

## The form

Steps: outlet, service, date and time (optional), your details. Without JavaScript all steps are
visible and the form posts to `admin-post.php` (Post/Redirect/Get, same validation). With
JavaScript it becomes a stepper:

- `<ol>` progress with `aria-current="step"`; "Step 2 of 4 · Service" text on small screens.
- Outlets and services are radio cards, dates and times are radio chips (arrow keys work).
- Validation on blur, then live while a field is in error. On submit, focus moves to the first
  invalid field and an `aria-live="assertive"` region announces "2 fields need attention."
- Messages follow design brief 6.3: Singapore mobile (8 digits starting 8 or 9, landline hint for
  6), first name (letters in any script), optional email with typo suggestion, PDPA consent.
- Success replaces the form in place (height reserved, focus moved to the message) with the
  reference and a prefilled WhatsApp link.
- Analytics (GTM `dataLayer`, design brief 6.7): `booking_start`, `booking_step_view`,
  `select_outlet`, `select_service`, `select_slot`, `no_slots_shown`, `form_error`,
  `booking_confirm`, `enquiry_submit` (deduplicated by reference), `contact_click`. Never name,
  phone or email.

## REST API

### `GET /wp-json/sbe/v1/availability`

| Param     | Required | Notes                                            |
| --------- | -------- | ------------------------------------------------ |
| `brand`   | yes      | `sable`, `dewlab`, `rootwell`                    |
| `outlet`  | yes      | e.g. `sable-tanjong-pagar`; must match the brand |
| `service` | no       | uses the service duration (default 60 min)       |
| `date`    | no       | `YYYY-MM-DD`; without it, returns 14 days        |

Mock but deterministic: a 30-minute grid inside opening hours, about a third of slots "taken"
(hash of outlet + date + time), roughly one fully booked day in eleven, nothing earlier than now
plus 60 minutes (Asia/Singapore). Same request, same answer, so it is cacheable
(`Cache-Control: public, max-age=60`).

```json
{
  "date": "2026-11-26",
  "count": 11,
  "slots": { "morning": [{ "time": "10:00", "label": "10 am" }], "afternoon": [], "evening": [] }
}
```

### `POST /wp-json/sbe/v1/enquiry`

JSON body: `brand`, `outlet`, `first_name`, `mobile`, `consent` (required); `service`, `date`,
`time`, `email`, `message`, `marketing` (optional); `website` is the honeypot.

| Status | When                                                                 |
| ------ | -------------------------------------------------------------------- |
| 201    | Stored. `{ message, ref, whatsapp_url }`                             |
| 403    | Missing/invalid `X-WP-Nonce` (`wp_rest`), checked for visitors too   |
| 409    | Chosen slot not free. `data.alternatives` = 3 nearest free slots     |
| 422    | Validation. `data.fields` = `{ field: message }`                     |
| 429    | Rate limited (default 5 per 15 min per client), `Retry-After` header |

Order of checks: nonce, honeypot (fake 201, nothing stored), rate limit (transients keyed by a
salted hash of `REMOTE_ADDR`; no raw IP stored), validation and sanitisation, slot check, insert.
No email is sent because the host blocks it; hook `salon_booking_enquiry_stored` to forward to a
webhook on hosts that allow outbound HTTP.

## Hooks

| Hook                                    | Type   | Purpose                                     |
| --------------------------------------- | ------ | ------------------------------------------- |
| `salon_booking_enquiry_catalogue`       | filter | Brands, outlets, services (all fictional)   |
| `salon_booking_enquiry_stored`          | action | After an enquiry is saved                   |
| `salon_booking_enquiry_client_ip`       | filter | Client IP for rate limiting (trusted proxy) |
| `salon_booking_enquiry_platform`        | filter | `site_platform` analytics value             |
| `salon_booking_enquiry_promo_active`    | filter | Show the promo on this request              |
| `salon_booking_enquiry_jsonld_business` | filter | LocalBusiness graph before output           |

## Privacy and data

- Personal data lives only in the `sbe_enquiry` posts (private, not in REST, not queryable).
- The no-JS flash message holds no personal data; analytics never receive it.
- Uninstall always removes settings and transients; it deletes enquiries only when _Delete
  enquiries on uninstall_ is ticked.

## Translation

Text domain `salon-booking-enquiry`, POT in `languages/`. The block editor script is registered
with `wp_set_script_translations()`. Regenerate the POT with
`wp i18n make-pot . languages/salon-booking-enquiry.pot` when strings change.

## Caching note

The form prints a REST nonce. If a page cache serves it for more than 12 to 24 hours, submissions
fail with a 403 asking the visitor to refresh. Exclude form pages from page caching or keep cache
lifetime under 12 hours.

## Development

From `wordpress/` (dev tools only, nothing ships to the server):

```sh
composer install
composer check        # php -l on every file, PHPCS (WordPress Coding Standards), PHPStan level 6
```
