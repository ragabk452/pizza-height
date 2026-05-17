/**
 * Pizza Height — Seed Data
 *
 * Populates the database with a luxurious sample restaurant:
 * - 6 categories (Signature Pizzas, Salads, Wines, Antipasti, Wings, Coffee & Desserts)
 * - 30+ items with Unsplash images
 * - Sizes (S/M/L/XL) for pizzas
 * - Modifier groups (Crust, Extra Toppings) with modifiers
 * - 1 admin staff user (email: admin@pizzaheight.com, password: AdminPass2026!)
 * - 3 demo customers with addresses
 * - 5 demo coupons
 * - Restaurant settings
 */

import { PrismaClient, UserRole, CouponType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * AI-generated food images via Pollinations.ai — free, no API key, and every URL
 * is guaranteed to match the item description (because the URL *is* the prompt).
 * Each prompt is tuned for moody, restaurant-grade food photography.
 */
function img(prompt: string, seed: number) {
  const encoded = encodeURIComponent(
    `${prompt}, professional food photography, dark moody luxury restaurant background, ` +
      `top-down angle, shallow depth of field, ultra realistic, 8k`,
  );
  return `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&seed=${seed}&nologo=true&model=flux`;
}

const IMG = {
  // Pizzas
  margherita: img(
    'Authentic Margherita pizza, fresh basil leaves, melted buffalo mozzarella, San Marzano tomato sauce, wood-fired crust',
    101,
  ),
  pepperoni: img(
    'Pepperoni pizza with crispy edges, melted mozzarella, herb garnish',
    102,
  ),
  truffle: img(
    'White truffle pizza with shaved black truffle, ricotta, mozzarella, wild mushrooms',
    103,
  ),
  quattroFormaggi: img(
    'Four-cheese pizza, gorgonzola parmigiano taleggio mozzarella, caramelized walnuts',
    104,
  ),
  diavola: img(
    'Spicy diavola pizza, red salami, calabrian chili peppers, mozzarella, oregano',
    105,
  ),
  burrata: img(
    'Pizza topped with creamy burrata cheese, prosciutto di parma, fresh arugula',
    106,
  ),
  funghi: img(
    'Wild mushroom pizza, taleggio, fontina cheese, fresh thyme, garlic oil',
    107,
  ),
  vegana: img(
    'Vegan pizza with roasted peppers, zucchini, eggplant, vegan cheese, basil pesto',
    108,
  ),
  hawaiian: img(
    'Gourmet hawaiian pizza with smoked ham, fire-roasted pineapple, jalapeno, cilantro',
    109,
  ),
  bbq: img(
    'BBQ chicken pizza with red onion, smoked chicken, sweet corn, cilantro, smoky barbecue sauce',
    110,
  ),

  // Salads
  caesar: img(
    'Caesar salad with crisp romaine, parmigiano shavings, anchovy, garlic croutons',
    201,
  ),
  caprese: img(
    'Caprese salad with buffalo mozzarella, heirloom tomato, fresh basil, balsamic glaze',
    202,
  ),
  arugula: img(
    'Arugula salad with poached pear, gorgonzola cheese, candied walnuts, honey vinaigrette',
    203,
  ),

  // Wines
  redWine: img(
    'Glass of red Chianti wine, italian restaurant table setting',
    301,
  ),
  whiteWine: img(
    'Glass of white pinot grigio wine with condensation, italian dinner setting',
    302,
  ),
  prosecco: img(
    'Glass of sparkling prosecco wine with bubbles, italian celebration',
    303,
  ),

  // Antipasti
  bruschetta: img(
    'Italian bruschetta trio, tomato basil topping, white bean rosemary, sauteed mushroom',
    401,
  ),
  arancini: img(
    'Sicilian arancini saffron risotto balls, golden crispy, marinara dipping sauce',
    402,
  ),
  prosciutto: img(
    'Prosciutto di parma with ripe cantaloupe melon, mint leaves, balsamic pearls',
    403,
  ),

  // Wings & Sides
  wings: img(
    'Crispy buffalo chicken wings, buffalo glaze, blue cheese dip, celery sticks',
    501,
  ),
  garlicBread: img(
    'Wood-fired garlic bread with melted mozzarella cheese, roasted garlic butter, fresh parsley',
    502,
  ),
  mozzarellaSticks: img(
    'Golden crispy mozzarella sticks with marinara dipping sauce, parmesan crust',
    503,
  ),

  // Desserts
  tiramisu: img(
    'Classic italian tiramisu, mascarpone cream, cocoa powder dust, espresso-soaked ladyfingers',
    601,
  ),
  cannoli: img(
    'Sicilian cannoli pastry, sweet ricotta filling, candied orange, crushed pistachios',
    602,
  ),
  espresso: img(
    'Double espresso doppio in italian ceramic cup, perfect crema, dark moody',
    603,
  ),
  affogato: img(
    'Affogato al caffe, vanilla gelato ice cream drowned in fresh espresso, italian glass',
    604,
  ),
};

async function main() {
  console.log('🍕 Seeding Pizza Height database...\n');

  // ============================================================
  // Clear existing data
  // ============================================================
  console.log('🧹 Clearing existing data...');
  await prisma.$transaction([
    prisma.orderItemModifier.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.couponUsage.deleteMany(),
    prisma.order.deleteMany(),
    prisma.address.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.review.deleteMany(),
    prisma.modifier.deleteMany(),
    prisma.modifierGroup.deleteMany(),
    prisma.itemSize.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.category.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.user.deleteMany(),
    prisma.setting.deleteMany(),
  ]);

  // ============================================================
  // Settings
  // ============================================================
  console.log('⚙️  Creating restaurant settings...');
  await prisma.setting.createMany({
    data: [
      { key: 'restaurant.name', value: 'Pizza Height' },
      { key: 'restaurant.tagline', value: 'Elevate Your Taste' },
      { key: 'restaurant.currency', value: 'USD' },
      { key: 'restaurant.vatPercent', value: 14 },
      { key: 'restaurant.serviceChargePercent', value: 0 },
      { key: 'restaurant.minOrderAmount', value: 15 },
      { key: 'restaurant.defaultDeliveryFee', value: 5 },
      {
        key: 'restaurant.workingHours',
        value: {
          mon: { open: '11:00', close: '23:00' },
          tue: { open: '11:00', close: '23:00' },
          wed: { open: '11:00', close: '23:00' },
          thu: { open: '11:00', close: '23:00' },
          fri: { open: '11:00', close: '02:00' },
          sat: { open: '11:00', close: '02:00' },
          sun: { open: '12:00', close: '23:00' },
        },
      },
    ],
  });

  // ============================================================
  // Staff Users
  // ============================================================
  console.log('👨‍🍳 Creating staff users...');
  const adminPassword = await bcrypt.hash('AdminPass2026!', 12);
  const kitchenPassword = await bcrypt.hash('KitchenPass2026!', 12);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@pizzaheight.com',
        passwordHash: adminPassword,
        name: 'Marco Rossi',
        role: UserRole.ADMIN,
      },
      {
        email: 'kitchen@pizzaheight.com',
        passwordHash: kitchenPassword,
        name: 'Giuseppe Romano',
        role: UserRole.KITCHEN,
      },
      {
        email: 'manager@pizzaheight.com',
        passwordHash: adminPassword,
        name: 'Sofia Bianchi',
        role: UserRole.MANAGER,
      },
    ],
  });

  // ============================================================
  // Categories
  // ============================================================
  console.log('📂 Creating categories...');
  const [pizzas, salads, wines, antipasti, wings, desserts] = await Promise.all(
    [
      prisma.category.create({
        data: {
          slug: 'signature-pizzas',
          name: 'Signature Pizzas',
          description:
            'Hand-crafted, wood-fired in 90 seconds. Our masterpieces.',
          imageUrl: IMG.margherita,
          sortOrder: 1,
        },
      }),
      prisma.category.create({
        data: {
          slug: 'fresh-salads',
          name: 'Fresh Salads',
          description: 'Crisp, vibrant, picked at peak.',
          imageUrl: IMG.caesar,
          sortOrder: 2,
        },
      }),
      prisma.category.create({
        data: {
          slug: 'italian-wines',
          name: 'Italian Wines',
          description: 'Curated reds, whites & sparkling.',
          imageUrl: IMG.redWine,
          sortOrder: 3,
        },
      }),
      prisma.category.create({
        data: {
          slug: 'antipasti',
          name: 'Antipasti',
          description: 'Italian starters to share.',
          imageUrl: IMG.bruschetta,
          sortOrder: 4,
        },
      }),
      prisma.category.create({
        data: {
          slug: 'wings-sides',
          name: 'Wings & Sides',
          description: 'Crispy. Bold. Addictive.',
          imageUrl: IMG.wings,
          sortOrder: 5,
        },
      }),
      prisma.category.create({
        data: {
          slug: 'coffee-desserts',
          name: 'Coffee & Desserts',
          description: 'A sweet finale, espresso strong.',
          imageUrl: IMG.tiramisu,
          sortOrder: 6,
        },
      }),
    ],
  );

  // ============================================================
  // Helper to create pizza with sizes & modifier groups
  // ============================================================
  const pizzaSizes = [
    {
      name: 'Small',
      diameterCm: 25,
      priceModifier: 0,
      isDefault: true,
      sortOrder: 1,
    },
    { name: 'Medium', diameterCm: 30, priceModifier: 4, sortOrder: 2 },
    { name: 'Large', diameterCm: 35, priceModifier: 8, sortOrder: 3 },
    { name: 'XLarge', diameterCm: 40, priceModifier: 12, sortOrder: 4 },
  ];

  type PizzaSeed = {
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
    basePrice: number;
    isPopular?: boolean;
    isSpicy?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isNew?: boolean;
  };

  const pizzaData: PizzaSeed[] = [
    {
      slug: 'truffle-bianca',
      name: 'Truffle Bianca',
      description:
        'White pizza base with mozzarella, ricotta, shaved black truffle, wild mushrooms, and a finishing drizzle of truffle oil.',
      imageUrl: IMG.truffle,
      basePrice: 24,
      isPopular: true,
    },
    {
      slug: 'margherita-dop',
      name: 'Margherita DOP',
      description:
        'San Marzano DOP tomatoes, buffalo mozzarella, hand-torn basil, extra virgin olive oil, sea salt.',
      imageUrl: IMG.margherita,
      basePrice: 18,
      isPopular: true,
      isVegetarian: true,
    },
    {
      slug: 'diavola-forte',
      name: 'Diavola Forte',
      description:
        'Spicy salami, Calabrian chilies, fior di latte, fresh oregano. For those who like it hot.',
      imageUrl: IMG.diavola,
      basePrice: 22,
      isSpicy: true,
    },
    {
      slug: 'quattro-formaggi',
      name: 'Quattro Formaggi',
      description:
        'Four cheeses: mozzarella, gorgonzola, parmigiano reggiano, taleggio. With caramelized walnuts.',
      imageUrl: IMG.quattroFormaggi,
      basePrice: 26,
      isVegetarian: true,
    },
    {
      slug: 'burrata-prosciutto',
      name: 'Burrata & Prosciutto',
      description:
        'Tomato base, mozzarella, finished with creamy burrata, 24-month prosciutto di Parma, and arugula.',
      imageUrl: IMG.burrata,
      basePrice: 28,
      isPopular: true,
      isNew: true,
    },
    {
      slug: 'funghi-di-bosco',
      name: 'Funghi di Bosco',
      description:
        'Wild forest mushrooms, taleggio, fontina, thyme, garlic oil. Earthy and elegant.',
      imageUrl: IMG.funghi,
      basePrice: 23,
      isVegetarian: true,
    },
    {
      slug: 'vegana-orto',
      name: 'Vegana dell&apos;Orto',
      description:
        'Tomato, vegan mozzarella, roasted peppers, zucchini, eggplant, sun-dried tomatoes, basil pesto.',
      imageUrl: IMG.vegana,
      basePrice: 21,
      isVegetarian: true,
      isVegan: true,
    },
    {
      slug: 'pepperoni-supreme',
      name: 'Pepperoni Supreme',
      description:
        'Triple-pepperoni layering, fior di latte, San Marzano tomato sauce, finishing oregano.',
      imageUrl: IMG.pepperoni,
      basePrice: 20,
      isPopular: true,
    },
    {
      slug: 'hawaii-reimagined',
      name: 'Hawaii Reimagined',
      description:
        'Smoked ham, fire-roasted pineapple, fior di latte, jalapeño, cilantro. The pineapple debate, ended.',
      imageUrl: IMG.hawaiian,
      basePrice: 21,
    },
    {
      slug: 'bbq-chicken',
      name: 'BBQ Chicken',
      description:
        'Smoked chicken, red onion, smoky BBQ sauce, mozzarella, fresh cilantro, sweet corn.',
      imageUrl: IMG.bbq,
      basePrice: 23,
    },
  ];

  console.log(`🍕 Creating ${pizzaData.length} signature pizzas...`);
  for (let i = 0; i < pizzaData.length; i++) {
    const p = pizzaData[i]!;
    const pizza = await prisma.menuItem.create({
      data: {
        categoryId: pizzas.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        basePrice: p.basePrice,
        isPopular: p.isPopular ?? false,
        isSpicy: p.isSpicy ?? false,
        isVegetarian: p.isVegetarian ?? false,
        isVegan: p.isVegan ?? false,
        isNew: p.isNew ?? false,
        prepTimeMin: 15,
        sortOrder: i + 1,
        sizes: { create: pizzaSizes },
      },
    });

    // Modifier groups: Crust Style + Extra Toppings
    const crustGroup = await prisma.modifierGroup.create({
      data: {
        menuItemId: pizza.id,
        name: 'Crust Style',
        isRequired: true,
        minSelection: 1,
        maxSelection: 1,
        sortOrder: 1,
      },
    });

    await prisma.modifier.createMany({
      data: [
        {
          modifierGroupId: crustGroup.id,
          name: 'Classic',
          priceModifier: 0,
          sortOrder: 1,
        },
        {
          modifierGroupId: crustGroup.id,
          name: 'Thin & Crispy',
          priceModifier: 0,
          sortOrder: 2,
        },
        {
          modifierGroupId: crustGroup.id,
          name: 'Stuffed Crust',
          priceModifier: 3,
          sortOrder: 3,
        },
        {
          modifierGroupId: crustGroup.id,
          name: 'Gluten-Free',
          priceModifier: 4,
          sortOrder: 4,
        },
      ],
    });

    const extrasGroup = await prisma.modifierGroup.create({
      data: {
        menuItemId: pizza.id,
        name: 'Extra Toppings',
        isRequired: false,
        minSelection: 0,
        maxSelection: 6,
        sortOrder: 2,
      },
    });

    await prisma.modifier.createMany({
      data: [
        {
          modifierGroupId: extrasGroup.id,
          name: 'Extra Cheese',
          priceModifier: 2.5,
          sortOrder: 1,
        },
        {
          modifierGroupId: extrasGroup.id,
          name: 'Pepperoni',
          priceModifier: 3,
          sortOrder: 2,
        },
        {
          modifierGroupId: extrasGroup.id,
          name: 'Mushrooms',
          priceModifier: 2,
          sortOrder: 3,
        },
        {
          modifierGroupId: extrasGroup.id,
          name: 'Black Olives',
          priceModifier: 1.5,
          sortOrder: 4,
        },
        {
          modifierGroupId: extrasGroup.id,
          name: 'Fresh Basil',
          priceModifier: 1,
          sortOrder: 5,
        },
        {
          modifierGroupId: extrasGroup.id,
          name: 'Truffle Oil',
          priceModifier: 4,
          sortOrder: 6,
        },
      ],
    });
  }

  // ============================================================
  // Other categories
  // ============================================================
  console.log('🥗 Creating salads, wines, antipasti, wings, desserts...');

  await prisma.menuItem.createMany({
    data: [
      // Salads
      {
        categoryId: salads.id,
        slug: 'caesar-classico',
        name: 'Caesar Classico',
        description:
          'Crisp romaine, house-made dressing, anchovy, parmigiano, garlic croutons.',
        imageUrl: IMG.caesar,
        basePrice: 12,
        isPopular: true,
        sortOrder: 1,
      },
      {
        categoryId: salads.id,
        slug: 'caprese-tradition',
        name: 'Caprese Tradition',
        description:
          'Buffalo mozzarella, heirloom tomato, basil, balsamic glaze, olive oil.',
        imageUrl: IMG.caprese,
        basePrice: 14,
        isVegetarian: true,
        sortOrder: 2,
      },
      {
        categoryId: salads.id,
        slug: 'arugula-pear',
        name: 'Arugula & Pear',
        description:
          'Wild arugula, poached pear, gorgonzola, candied walnuts, honey vinaigrette.',
        imageUrl: IMG.arugula,
        basePrice: 13,
        isVegetarian: true,
        sortOrder: 3,
      },
      // Wines
      {
        categoryId: wines.id,
        slug: 'chianti-classico',
        name: 'Chianti Classico DOCG',
        description:
          'Tuscany. Notes of red cherry, leather, dried herbs. Glass.',
        imageUrl: IMG.redWine,
        basePrice: 12,
        sortOrder: 1,
      },
      {
        categoryId: wines.id,
        slug: 'pinot-grigio',
        name: 'Pinot Grigio Veneto',
        description: 'Crisp and refreshing white. Citrus and pear. Glass.',
        imageUrl: IMG.whiteWine,
        basePrice: 10,
        sortOrder: 2,
      },
      {
        categoryId: wines.id,
        slug: 'prosecco-extra-dry',
        name: 'Prosecco Extra Dry',
        description:
          'Bright bubbles, apple, white peach. Perfect with everything. Glass.',
        imageUrl: IMG.prosecco,
        basePrice: 11,
        isPopular: true,
        sortOrder: 3,
      },
      // Antipasti
      {
        categoryId: antipasti.id,
        slug: 'bruschetta-trio',
        name: 'Bruschetta Trio',
        description:
          'Three crostini: tomato-basil, white bean & rosemary, sautéed mushroom.',
        imageUrl: IMG.bruschetta,
        basePrice: 11,
        isVegetarian: true,
        sortOrder: 1,
      },
      {
        categoryId: antipasti.id,
        slug: 'arancini-saffron',
        name: 'Arancini al Zafferano',
        description:
          'Saffron risotto balls, mozzarella heart, marinara dipping sauce.',
        imageUrl: IMG.arancini,
        basePrice: 13,
        isVegetarian: true,
        isPopular: true,
        sortOrder: 2,
      },
      {
        categoryId: antipasti.id,
        slug: 'prosciutto-melon',
        name: 'Prosciutto & Melon',
        description:
          '24-month aged prosciutto di Parma, ripe cantaloupe, mint, balsamic pearls.',
        imageUrl: IMG.prosciutto,
        basePrice: 16,
        sortOrder: 3,
      },
      // Wings & Sides
      {
        categoryId: wings.id,
        slug: 'buffalo-wings',
        name: 'Buffalo Wings',
        description:
          'Crispy wings, house buffalo glaze, blue cheese dip, celery sticks. 8 pcs.',
        imageUrl: IMG.wings,
        basePrice: 13,
        isSpicy: true,
        isPopular: true,
        sortOrder: 1,
      },
      {
        categoryId: wings.id,
        slug: 'garlic-bread',
        name: 'Garlic Bread',
        description:
          'Wood-fired bread, roasted garlic butter, mozzarella, parsley.',
        imageUrl: IMG.garlicBread,
        basePrice: 7,
        isVegetarian: true,
        sortOrder: 2,
      },
      {
        categoryId: wings.id,
        slug: 'mozzarella-sticks',
        name: 'Mozzarella Sticks',
        description:
          'Hand-breaded mozzarella, marinara dip, parmesan crust. 6 pcs.',
        imageUrl: IMG.mozzarellaSticks,
        basePrice: 9,
        isVegetarian: true,
        sortOrder: 3,
      },
      // Coffee & Desserts
      {
        categoryId: desserts.id,
        slug: 'tiramisu',
        name: 'Tiramisu della Nonna',
        description:
          'Mascarpone, espresso-soaked savoiardi, cocoa, marsala. The original recipe.',
        imageUrl: IMG.tiramisu,
        basePrice: 8,
        isVegetarian: true,
        isPopular: true,
        sortOrder: 1,
      },
      {
        categoryId: desserts.id,
        slug: 'cannoli-siciliani',
        name: 'Cannoli Siciliani',
        description:
          'Crisp shells, sweet ricotta, candied orange, pistachio. 2 pcs.',
        imageUrl: IMG.cannoli,
        basePrice: 7,
        isVegetarian: true,
        sortOrder: 2,
      },
      {
        categoryId: desserts.id,
        slug: 'espresso-doppio',
        name: 'Espresso Doppio',
        description: 'Double shot, Italian arabica blend, perfect crema.',
        imageUrl: IMG.espresso,
        basePrice: 4,
        isVegetarian: true,
        sortOrder: 3,
      },
      {
        categoryId: desserts.id,
        slug: 'affogato',
        name: 'Affogato al Caffè',
        description:
          'Vanilla gelato drowned in fresh espresso. Simple. Perfect.',
        imageUrl: IMG.affogato,
        basePrice: 6,
        isVegetarian: true,
        isNew: true,
        sortOrder: 4,
      },
    ],
  });

  // ============================================================
  // Demo customers
  // ============================================================
  console.log('👥 Creating demo customers...');
  const customerPassword = await bcrypt.hash('DemoPass2026!', 12);

  await prisma.customer.create({
    data: {
      email: 'layla@example.com',
      phone: '+201001112222',
      passwordHash: customerPassword,
      name: 'Layla Hassan',
      emailVerified: true,
      phoneVerified: true,
      addresses: {
        create: [
          {
            label: 'Home',
            street: '12 El-Tahrir Street',
            building: '5',
            apartment: '3A',
            floor: '3',
            area: 'Zamalek',
            city: 'Cairo',
            governorate: 'Cairo',
            landmark: 'Near Marriott Hotel',
            latitude: 30.0626,
            longitude: 31.2197,
            isDefault: true,
          },
        ],
      },
    },
  });

  await prisma.customer.create({
    data: {
      email: 'sara@example.com',
      phone: '+201112223333',
      passwordHash: customerPassword,
      name: 'Sara Khalil',
      emailVerified: true,
      addresses: {
        create: [
          {
            label: 'Work',
            street: '88 Mohandessin Avenue',
            building: '12',
            area: 'Mohandessin',
            city: 'Giza',
            latitude: 30.0444,
            longitude: 31.2357,
            isDefault: true,
          },
        ],
      },
    },
  });

  await prisma.customer.create({
    data: {
      phone: '+201223334444',
      passwordHash: customerPassword,
      name: 'Ahmed Farouk',
      phoneVerified: true,
    },
  });

  // ============================================================
  // Coupons
  // ============================================================
  console.log('🎟️  Creating coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME20',
        description: '20% off your first order',
        type: CouponType.PERCENTAGE,
        value: 20,
        minOrderTotal: 20,
        maxDiscount: 15,
        firstOrderOnly: true,
      },
      {
        code: 'PIZZA10',
        description: '$10 off orders over $50',
        type: CouponType.FIXED,
        value: 10,
        minOrderTotal: 50,
        maxUsesPerCustomer: 3,
      },
      {
        code: 'FREEDELIVERY',
        description: 'Free delivery on any order',
        type: CouponType.FREE_DELIVERY,
        value: 0,
      },
      {
        code: 'LUXE15',
        description: '15% off — luxury treat for our loyalists',
        type: CouponType.PERCENTAGE,
        value: 15,
        maxDiscount: 25,
      },
      {
        code: 'WEEKEND',
        description: '$5 off weekend orders',
        type: CouponType.FIXED,
        value: 5,
        minOrderTotal: 25,
      },
    ],
  });

  // ============================================================
  // Summary
  // ============================================================
  const counts = {
    categories: await prisma.category.count(),
    menuItems: await prisma.menuItem.count(),
    sizes: await prisma.itemSize.count(),
    modifierGroups: await prisma.modifierGroup.count(),
    modifiers: await prisma.modifier.count(),
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    addresses: await prisma.address.count(),
    coupons: await prisma.coupon.count(),
    settings: await prisma.setting.count(),
  };

  console.log('\n✅ Seeding complete!\n');
  console.table(counts);
  console.log('\n📧 Login credentials (staff):');
  console.log('   admin@pizzaheight.com   / AdminPass2026!');
  console.log('   manager@pizzaheight.com / AdminPass2026!');
  console.log('   kitchen@pizzaheight.com / KitchenPass2026!');
  console.log('\n📱 Login credentials (customers):');
  console.log('   layla@example.com / DemoPass2026!');
  console.log('   sara@example.com  / DemoPass2026!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
