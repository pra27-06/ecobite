# Maharaja Agrasen Institute of Technology (MAIT) — Ground-Truth Dataset

> **Campus Identifier:** `MAIT`  
> **Institution:** Maharaja Agrasen Institute of Technology, PSP Area, Sector 22, Rohini, Delhi 110086  
> **Pilot Status:** Active Pilot Campus (Hackathon Ground Truth)  
> **Source Verification:** 100% extracted from high-resolution on-site physical menu board photographs. Zero artificial price estimations or AI hallucinations.

---

## 1. Architectural Role in EcoBite AI

EcoBite AI is a national platform that separates public general food intelligence from authentic, institution-specific canteen operations. 

- **MAIT** is the **first and only** real campus dataset in this stage.
- Selecting "MAIT" from a dropdown or entering it via URL parameters **never** reveals campus pricing.
- Campus data is strictly protected behind the **Verified Campus Mode** (`isCampusVerified === true`), unlocking only upon physical campus QR verification.
- Smart Swaps for verified MAIT students are bounded strictly to dishes sold at MAIT canteens.

---

## 2. Audited Campus Stalls & Canteens

EcoBite has mapped **4 distinct physical dining establishments** across the MAIT campus:

| Canteen ID | Official Name | Physical Location | Category / Specialties | Verified Dishes |
| :--- | :--- | :--- | :--- | :---: |
| `amul-shop` | **Amul Shop** | Block 3 Courtyard, Ground Floor | Patties, Sandwiches, Burgers, Fries, Shakes, Teas | 26 |
| `food-mast` | **Food Mast** | Main Dining Hall, Ground Floor | North Indian Meals, Chawal, Chinese, Fast Food, Snacks | 25 |
| `juice-point` | **Juice Point** | Sports Complex Kiosk | Fresh Fruit Juices (S/M/L), Shakes, Lassi, Mojitos | 13 |
| `nescafe-maggi` | **Nescafé / Maggi Point** | Central Academic Lawn Kiosk | Maggi Variations, Nescafé Coffees, Hot Soups, Cold Frappes | 11 |

**Total Verified Menu Catalog:** **75 distinct dishes/beverages** with verified ground-truth prices.

---

## 3. Verified Menu Catalog by Canteen

### 3.1 Amul Shop (`amul-shop`)
*Source Photo: `amul_shop_menu.jpg`*

| Item Name | Category | Exact Price (₹) | Ground Truth Verification Details |
| :--- | :--- | :---: | :--- |
| **Aloo Patties** | Snacks | ₹20 | Base snack, standard vegetarian |
| **Paneer Patties** | Snacks | ₹25 | Protein-rich puff pastry |
| **Paneer Sandwich** | Snacks | ₹30 | Plain sliced bread with paneer filling |
| **Pizza Sandwich** | Fast Food | ₹40 | Sliced sandwich with vegetable & pizza seasoning |
| **Grill Sandwich** | Fast Food | ₹60 | Toasted jumbo grilled vegetable sandwich |
| **Cheese Grill Sandwich** | Fast Food | ₹80 | Grilled sandwich with processed cheese |
| **Paneer Grill Sandwich** | Fast Food | ₹80 | Grilled sandwich with cottage cheese slice |
| **Cheese Corn Grill Sandwich** | Fast Food | ₹100 | Premium sandwich with sweet corn & double cheese |
| **Masala Maggie** | Quick Bites | ₹40 | Cooked noodle bowl with vegetables & spices |
| **Cheese Maggie** | Quick Bites | ₹50 | Cooked noodle bowl with processed cheese topping |
| **Paneer Kulcha** | Snacks | ₹30 | Stuffed heated kulcha flatbread with paneer |
| **Veg Burger** | Fast Food | ₹40 | Potato patty burger with lettuce & tomato |
| **Cheese Burger** | Fast Food | ₹50 | Veg burger topped with Amul cheese slice |
| **Hot Dog** | Fast Food | ₹40 | Vegetarian hot dog roll with spiced filling |
| **Brownie** | Desserts | ₹50 | Single portion chocolate brownie |
| **French Fries** | Sides | ₹50 | Deep-fried salted potato fingers |
| **Peri Peri Fries** | Sides | ₹60 | French fries tossed in peri peri spice blend |
| **Cheese Fries** | Sides | ₹70 | French fries drizzled with melted cheese |
| **Kurkure Momos** | Snacks | ₹80 | Crispy breaded fried vegetarian dumplings |
| **Spiral Potato** | Snacks | ₹50 | Skewered tornado spiral fried potato |
| **Cheese Spiral Potato** | Snacks | ₹60 | Spiral tornado potato coated in cheese seasoning |
| **Cold Coffee** | Beverages | ₹40 | Chilled milk-based blended coffee |
| **Chocolate Shake** | Beverages | ₹40 | Blended chocolate milk shake (Glass: ₹40, Jumbo: ₹100) |
| **Tea (Chai)** | Beverages | ₹15 | Freshly brewed Indian milk tea |
| **Hot Coffee** | Beverages | ₹25 | Steamed frothed milk coffee |
| **Fruit Chill** | Beverages | ₹20 | Amul branded chilled fruit refreshment |

---

### 3.2 Food Mast (`food-mast`)
*Source Photo: `food_mast_menu.jpg`*

| Item Name | Category | Exact Price (₹) | Ground Truth Verification Details |
| :--- | :--- | :---: | :--- |
| **Veg Sandwich** | Snacks | ₹20 | Cold vegetable sandwich |
| **Aloo Patie** | Snacks | ₹20 | Spiced potato puff patty |
| **Paneer Patie** | Snacks | ₹25 | Spiced cottage cheese puff patty |
| **Bread Pakora** | Snacks | ₹20 | Gram flour battered fried bread stuffed with potato |
| **French Fries** | Sides | ₹70 | Full plate salted crispy fries |
| **Peri-Peri Fries** | Sides | ₹100 | Full plate spicy peri-peri dusted fries |
| **Maggi** | Quick Bites | ₹30 | Classic plain cooked Maggi noodles |
| **Rajma Chawal** | Meals | ₹70 | Kidney bean curry served with steamed basmati rice |
| **Choley Chawal** | Meals | ₹70 | Spiced chickpea gravy with steamed basmati rice |
| **Choley Bhature** | Meals | ₹70 | 2 fried bhature served with spicy chickpea curry & onions |
| **Choley Kulche** | Meals | ₹50 | 2 toasted kulchas served with spiced choley |
| **Pav Bhaji** | Meals | ₹80 | 2 buttered pav buns served with mixed vegetable bhaji |
| **Samber Wada** | South Indian | ₹80 | 2 crispy lentil wadas immersed in lentil stew |
| **Burger** | Fast Food | ₹40 | Standard vegetable burger |
| **Chowmein** | Chinese | ₹90 | Stir-fried noodles with shredded cabbage & carrots |
| **Singapori Chowmein** | Chinese | ₹120 | Spicy yellow curry flavored stir-fried noodles |
| **Manchurian** | Chinese | ₹90 | Vegetable dumpling balls in savory soy-garlic gravy |
| **Fried Rice Manchurian** | Chinese Meals | ₹150 | Combo plate of vegetable fried rice with Manchurian |
| **Chilli Potato** | Chinese | ₹90 | Crispy fried potato strips tossed in sweet chilli sauce |
| **Honey Chilli Potato** | Chinese | ₹110 | Crispy potatoes glazed with honey and toasted sesame |
| **Veg Paneer Spring Roll** | Chinese | ₹100 | Crispy fried spring rolls stuffed with paneer & veggies |
| **Pasta** | Fast Food | ₹120 | Penne pasta in creamy red/white mixed sauce |
| **Spl. Kulhad Tea** | Beverages | ₹25 | Traditional hot milk tea served in an earthen kulhad cup |
| **Coffee** | Beverages | ₹20 | Hot instant coffee |
| **Aloo Samosa** | Snacks | ₹20 | Classic crisp triangular pastry filled with spiced potatoes |

---

### 3.3 Juice Point (`juice-point`)
*Source Photo: `juice_point_menu.jpg`*

*Note: Juices feature multiple size variants clearly listed on the board: **Small (S)**, **Medium (M)**, and **Large (L)**.*

| Item Name | Category | Base Price (₹) | Variant Pricing Structure |
| :--- | :--- | :---: | :--- |
| **Mix Fruit Juice** | Fresh Juices | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Mosambi Juice** | Fresh Juices | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Orange Juice** | Fresh Juices | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Pineapple Juice** | Fresh Juices | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Watermelon Juice** | Fresh Juices | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Apple Juice** | Fresh Juices | ₹40 | Small: ₹40 \| Medium: ₹60 \| Large: ₹80 |
| **Anar (Pomegranate) Juice** | Fresh Juices | ₹40 | Small: ₹40 \| Medium: ₹60 \| Large: ₹80 |
| **Veg Healthy Juice** | Fresh Juices | ₹40 | Small: ₹40 \| Medium: ₹60 \| Large: ₹80 |
| **Banana Shake** | Shakes | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Mango Shake** | Shakes | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Papaya Shake** | Shakes | ₹30 | Small: ₹30 \| Medium: ₹40 \| Large: ₹50 |
| **Mint Mojito** | Mocktails | ₹50 | Flat standard glass: ₹50 |
| **Sweet Lassi** | Traditional | ₹50 | Flat kulhad glass: ₹50 |

---

### 3.4 Nescafé / Maggi Point (`nescafe-maggi`)
*Source Photo: `nescafe_maggi_menu.jpg`*

| Item Name | Category | Exact Price (₹) | Ground Truth Verification Details |
| :--- | :--- | :---: | :--- |
| **Maggi Select** | Maggi | ₹50 | Standard seasoned Maggi portion |
| **Maggi Premium** | Maggi | ₹60 | Maggi enriched with vegetables & special masala |
| **Maggi Exotic** | Maggi | ₹70 | Maggi loaded with sweet corn, cheese & exotic veggies |
| **Maggi Limited Edition** | Maggi | ₹100 | Chef's special double-portion deluxe Maggi |
| **Sweet Corn Maggi** | Maggi | ₹50 | Steamed golden sweet corn kernel portion |
| **Nescafé Hot Coffee (Select)** | Hot Beverages | ₹20 | Small cup hot classic Nescafé coffee |
| **Nescafé Hot Coffee (Premium)** | Hot Beverages | ₹30 | Regular cup rich frothy Nescafé coffee |
| **Nescafé Hot Coffee (Limited)** | Hot Beverages | ₹50 | Large mug premium frothed coffee |
| **Hot Soup Bowl** | Soups | ₹30 | Hot tomato / sweet corn soup cup |
| **Nescafé Iced Tea** | Cold Beverages | ₹50 | Glass: ₹50 \| Jumbo: ₹80 (Lemon & Peach flavors) |
| **Nescafé Cold Coffee / Frappe** | Cold Beverages | ₹60 | Glass: ₹60 \| Jumbo: ₹100 |

---

## 4. Rigorous Exclusion Audit (Hallucination Prevention)

To maintain absolute data integrity, the following items and fees visible in the source photos were **strictly excluded** from the database:

| Item / Feature | Canteen | Reason for Exclusion |
| :--- | :--- | :--- |
| **Packaged Ice Creams & Cones** | Amul Shop | Sold strictly at retail MRP; prices vary per brand packaging |
| **Packaged Flavored Milk Bottles** | Amul Shop | Retail FMCG MRP product |
| **Packing Charge (₹10)** | All Canteens | Takeaway surcharge, not a food consumption item |
| **Cutlery Charge (₹2 - ₹5)** | Food Mast | Disposable spoon/fork fee, excluded from nutritional pricing |
| **Masala Tea (Obscured)** | Food Mast | Covered by an opaque orange sticky note; price not 100% verifiable |
| **Chilli Paneer (Obscured)** | Food Mast | Partially obscured by handwritten yellow correction slip |
| **Seasonal Strawberry Shake** | Juice Point | Marked "Seasonal / Out of Stock" on board chalk notes |

---

## 5. Cloud Firestore Data Schema

Deterministic document keys are enforced to avoid collisions and allow idempotent seeding:

```
firestore/
├── campuses/
│   └── MAIT                          # CampusDoc
│       ├── campusId: "MAIT"
│       ├── name: "Maharaja Agrasen Institute of Technology"
│       ├── shortName: "MAIT"
│       ├── city: "Delhi"
│       ├── verified: true
│       └── activeCanteenIds: ["amul-shop", "food-mast", "juice-point", "nescafe-maggi"]
│
├── canteens/
│   ├── amul-shop                     # CanteenDoc
│   ├── food-mast                     # CanteenDoc
│   ├── juice-point                   # CanteenDoc
│   └── nescafe-maggi                 # CanteenDoc
│
└── menuItems/
    ├── mait-amul-aloo-patties        # MenuItemDoc (campusId: "MAIT")
    ├── mait-fm-choley-bhature        # MenuItemDoc (campusId: "MAIT")
    ├── mait-jp-mosambi-juice         # MenuItemDoc (campusId: "MAIT")
    └── mait-nes-maggi-select         # MenuItemDoc (campusId: "MAIT")
```

---

## 6. How to Seed into Cloud Firestore

Run the automated deterministic seed utility:

```powershell
# In project root:
npm run seed:mait
```

Or execute directly via `ts-node` / `tsx`:
```powershell
npx tsx src/scripts/seedMaitData.ts
```

The script operates idempotently using `setDoc({ ... }, { merge: true })`, ensuring that repeated runs never duplicate records or overwrite live operational fields.
