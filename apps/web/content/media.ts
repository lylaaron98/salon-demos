import type { BrandId } from "@salon-demos/tokens";

/**
 * Photography for each brand: free Unsplash photos (https://unsplash.com/license),
 * hotlinked from Unsplash's CDN through `lib/unsplash-loader.ts`. Credits are shown
 * on /credits even though the licence does not require them.
 *
 * Keys match the slugs in the brand content, so a new service or team member
 * without a photo falls back to the gradient placeholder.
 *
 * `alt` describes the photo. Cards whose heading already names the subject use
 * empty alt instead (see the brand page), so screen readers don't hear it twice.
 */

export type Photo = {
  /** Unsplash photo id, passed to next/image as `src`. */
  id: string;
  alt: string;
  credit: string;
  /** Photo page on Unsplash. */
  href: string;
};

export type BrandPhotos = {
  hero: Photo;
  services: Record<string, Photo>;
  outlets: Record<string, Photo>;
  team: Record<string, Photo>;
};

export const photos: Record<BrandId, BrandPhotos> = {
  sable: {
    hero: {
      id: "photo-1634449571010-02389ed0f9b0",
      alt: "A stylist rinsing a client's hair at a salon wash basin",
      credit: "Lindsay Cash",
      href: "https://unsplash.com/photos/a-woman-getting-her-hair-cut-by-a-hair-stylist-Md_DhaFsnCQ",
    },
    services: {
      "precision-cut": {
        id: "photo-1700760934268-8aa0ef52ce0a",
        alt: "A stylist cutting a client's hair with scissors",
        credit: "Farhad Ibrahimzade",
        href: "https://unsplash.com/photos/a-woman-cutting-another-womans-hair-with-scissors-V2HDOQTJh3o",
      },
      "root-colour": {
        id: "photo-1595475884562-073c30d45670",
        alt: "Hands holding hairbrushes, scissors and a tinting brush",
        credit: "Adam Winger",
        href: "https://unsplash.com/photos/hairdressing-tools-held-by-hands-KVVjmb3IIL8",
      },
      "hand-painted-balayage": {
        id: "photo-1554519934-e32b1629d9ee",
        alt: "Long hair with soft, lived-in colour",
        credit: "Jessie Dee Dabrowski",
        href: "https://unsplash.com/photos/person-wearing-black-top-W6cwaL7PMSw",
      },
      "bridal-trial": {
        id: "photo-1549236177-77e8271c34b6",
        alt: "A bride wearing a white floral hair accessory",
        credit: "Angelo Pantazis",
        href: "https://unsplash.com/photos/woman-wearing-white-floral-hair-accessory-yq2zyWLzaR0",
      },
    },
    outlets: {
      "tiong-bahru": {
        id: "photo-1781450090585-1a511b7066d9",
        alt: "A modern salon interior with stylish chairs and mirrors",
        credit: "Barney Goodman",
        href: "https://unsplash.com/photos/a-modern-hair-salon-interior-with-stylish-chairs-and-mirrors-_Fy7Kq0w6OI",
      },
      "tanjong-pagar": {
        id: "photo-1703792686930-9efa64a9c6c5",
        alt: "Styling chairs, mirrors and warm lights in a salon",
        credit: "Kawê Rodrigues",
        href: "https://unsplash.com/photos/a-hair-salon-with-chairs-and-mirrors-and-lights-SUBpTBqFc6c",
      },
      "holland-village": {
        id: "photo-1633681926022-84c23e8cb2d6",
        alt: "A salon with black chairs, round mirrors and a brick wall",
        credit: "Benyamin Bohlouli",
        href: "https://unsplash.com/photos/modern-hair-salon-with-black-chairs-LGXN4OSQSa4",
      },
    },
    team: {
      "elena-tan": {
        id: "photo-1616325629936-99a9013c29c6",
        alt: "Portrait",
        credit: "Pj Go",
        href: "https://unsplash.com/photos/woman-in-white-long-sleeve-shirt-arPZr6tqsoA",
      },
      "farah-ismail": {
        id: "photo-1585917170055-e40d30c73414",
        alt: "Portrait",
        credit: "Afif Ramdhasuma",
        href: "https://unsplash.com/photos/woman-in-black-crew-neck-shirt-_XbueRj_pQM",
      },
      "marcus-lim": {
        id: "photo-1611403119860-57c4937ef987",
        alt: "Portrait",
        credit: "Hà Nguyễn",
        href: "https://unsplash.com/photos/smiling-man-in-white-shirt-OFSQ6bHjFjs",
      },
      "anjali-menon": {
        id: "photo-1619718908820-5c1de14e0b7e",
        alt: "Portrait",
        credit: "Michael Dagonakis",
        href: "https://unsplash.com/photos/woman-in-black-long-sleeve-shirt-smiling-c-SBcqkApls",
      },
    },
  },
  dewlab: {
    hero: {
      id: "photo-1570172619644-dfd03ed5d881",
      alt: "A client relaxing during a facial mask treatment",
      credit: "Rosa Rafael",
      href: "https://unsplash.com/photos/woman-receiving-facial-mask-treatment-at-spa-Pe9IXUuC6QU",
    },
    services: {
      "hydra-glow-facial": {
        id: "photo-1643684391140-c5056cfd3436",
        alt: "A facial massage in a treatment room",
        credit: "Dominique Rivas",
        href: "https://unsplash.com/photos/a-woman-getting-a-facial-massage-on-her-face-rWwuf8yKw4Y",
      },
      "skin-analysis": {
        id: "photo-1552693673-1bf958298935",
        alt: "A therapist assessing a client's skin",
        credit: "karelys Ruiz",
        href: "https://unsplash.com/photos/woman-receiving-facial-skincare-treatment-PqyzuzFiQfY",
      },
      "gentle-peel": {
        id: "photo-1713085085470-fba013d67e65",
        alt: "A gentle facial peel being applied",
        credit: "Look Studio",
        href: "https://unsplash.com/photos/a-woman-getting-a-facial-peel-from-a-doctor-HtXyytr9304",
      },
      "led-calm": {
        id: "photo-1740350631565-6a5081a2f841",
        alt: "A client resting under an LED light treatment",
        credit: "Alex Lam",
        href: "https://unsplash.com/photos/a-woman-in-a-white-dress-laying-on-a-bed-H_9RoVZlbzU",
      },
    },
    outlets: {
      novena: {
        id: "photo-1781513144825-aa1e284c5950",
        alt: "A bright reception with curved lines and glass partitions",
        credit: "何青蓝",
        href: "https://unsplash.com/photos/modern-white-reception-area-with-curved-lines-and-glass-partitions-ECBg5FQkBXI",
      },
      katong: {
        id: "photo-1745327883290-1e9c6447b938",
        alt: "A clean, calm treatment room ready for a session",
        credit: "Jakub Klucký",
        href: "https://unsplash.com/photos/a-massage-room-is-clean-and-ready-for-a-session-oAvwAKFiU7Q",
      },
      bugis: {
        id: "photo-1693578538512-fc66f318c833",
        alt: "Two chairs in a quiet treatment lounge",
        credit: "Sherzod Gulomov",
        href: "https://unsplash.com/photos/a-couple-of-chairs-sitting-next-to-each-other-in-a-room-npE_I2GzpHY",
      },
    },
    team: {
      "priya-nair": {
        id: "photo-1573497019236-17f8177b81e8",
        alt: "Portrait",
        credit: "Christina @ wocintechchat.com",
        href: "https://unsplash.com/photos/woman-smiling-and-sitting-PlikkWB79qs",
      },
      "joanne-koh": {
        id: "photo-1513097633097-329a3a64e0d4",
        alt: "Portrait",
        credit: "Le Minh Phuong",
        href: "https://unsplash.com/photos/woman-in-white-striped-top-jGZITdFhmts",
      },
      "siti-rahman": {
        id: "photo-1600481176431-47ad2ab2745d",
        alt: "Portrait",
        credit: "panitan punpuang",
        href: "https://unsplash.com/photos/woman-in-black-shirt-smiling-OuxJHYeUYpk",
      },
      "grace-lee": {
        id: "photo-1526413232644-8a40f03cc03b",
        alt: "Portrait",
        credit: "Aiony Haust",
        href: "https://unsplash.com/photos/woman-leaning-on-white-table-f2ar0ltTvaI",
      },
    },
  },
  rootwell: {
    hero: {
      id: "photo-1757066033634-bbbf874ce525",
      alt: "A client receiving a relaxing head massage",
      credit: "Anna Blake",
      href: "https://unsplash.com/photos/woman-receiving-a-head-massage-on-a-pillow-qyUR9meb4bU",
    },
    services: {
      "scalp-check": {
        id: "photo-1633179963355-44f57f194d54",
        alt: "A man checking his hair and scalp",
        credit: "Towfiqu barbhuiya",
        href: "https://unsplash.com/photos/a-man-is-combing-his-hair-with-his-hands-FGqEuM0wuKk",
      },
      "head-spa": {
        id: "photo-1717160675158-fdd75b8595cf",
        alt: "A steam massage at a spa",
        credit: "QUENTIN Mahe",
        href: "https://unsplash.com/photos/a-woman-getting-a-steam-facial-massage-at-a-spa-Vx0jSF5e_vE",
      },
      "scalp-detox": {
        id: "photo-1637777269308-6a072f24e8a4",
        alt: "A row of wash basins and chairs",
        credit: "Giorgio Trovato",
        href: "https://unsplash.com/photos/a-row-of-black-and-white-chairs-next-to-a-sink-k5xtu6DApUk",
      },
      "thinning-programme": {
        id: "photo-1773078280516-df823e1c9d78",
        alt: "A comb with loose strands of hair",
        credit: "Kier in Sight Archives",
        href: "https://unsplash.com/photos/a-black-comb-with-loose-strands-of-hair-f1j9b7AC_ps",
      },
    },
    outlets: {
      bishan: {
        id: "photo-1773924093206-9a433a14bb44",
        alt: "Lounge chairs in a sunlit spa room",
        credit: "Virginia Marinova",
        href: "https://unsplash.com/photos/relaxing-lounge-chairs-in-a-sunlit-spa-room-FkB2CUuqU_c",
      },
      tampines: {
        id: "photo-1761470575018-135c213340eb",
        alt: "A calm steam room lit by a candle and soft ambient light",
        credit: "Dominik Neuner",
        href: "https://unsplash.com/photos/a-modern-steam-room-with-a-candle-and-ambient-lighting-9qYFu1NzpS8",
      },
    },
    team: {
      "daniel-ong": {
        id: "photo-1544168190-79c17527004f",
        alt: "Portrait",
        credit: "Juan Encalada",
        href: "https://unsplash.com/photos/man-in-denim-shirt-at-desk-WC7KIHo13Fc",
      },
      "rizwan-hassan": {
        id: "photo-1670110531916-41045e83cb0a",
        alt: "Portrait",
        credit: "DICSON",
        href: "https://unsplash.com/photos/a-man-with-a-beard-and-mustache-vAXmZOtLfo0",
      },
      "karen-goh": {
        id: "photo-1589525231707-f2de2428f59c",
        alt: "Portrait",
        credit: "Thanh Duc PHAN",
        href: "https://unsplash.com/photos/woman-in-white-tank-top-i5R8hbZFDdc",
      },
      "vikram-das": {
        id: "photo-1596604820148-da737958af16",
        alt: "Portrait",
        credit: "Jean Daniel Photography",
        href: "https://unsplash.com/photos/man-in-white-crew-neck-shirt--GCQiA7oDKk",
      },
    },
  },
};

/** Every photo with its credit, for the credits page. */
export const allPhotos: Photo[] = Object.values(photos).flatMap((brand) => [
  brand.hero,
  ...Object.values(brand.services),
  ...Object.values(brand.outlets),
  ...Object.values(brand.team),
]);
