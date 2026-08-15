import { writeFileSync } from 'fs';

const groups = [
  // --- Staples & Grains ---
  { category: 'Staples & Grains', unit: 'kg', base: 120, names: ['Basmati Rice','Sella Basmati Rice','Brown Basmati Rice','Jasmine Rice','Gobindobhog Rice'] },
  { category: 'Staples & Grains', unit: 'kg', base: 55, names: ['White Rice','Kolam Rice','Sona Masoori Rice','Ponni Rice','Idli Rice','Brown Rice'] },
  { category: 'Staples & Grains', unit: 'kg', base: 45, names: ['Poha','Thick Poha','Thin Poha','Rice Flakes','Sabudana'] },
  { category: 'Staples & Grains', unit: 'kg', base: 160, names: ['Quinoa','Rolled Oats','Instant Oats','Steel Cut Oats','Oats'] },
  { category: 'Staples & Grains', unit: 'piece', base: 120, names: ['Corn Flakes','Wheat Flakes','Muesli','Granola','Dalia'] },
  { category: 'Staples & Grains', unit: 'kg', base: 40, names: ['Broken Wheat','Semolina','Fine Suji','Rava','Maida'] },
  { category: 'Staples & Grains', unit: 'kg', base: 48, names: ['Whole Wheat Flour','Multigrain Atta','Bread Flour','All Purpose Flour'] },
  { category: 'Staples & Grains', unit: 'kg', base: 70, names: ['Besan','Gram Flour','Rice Flour','Corn Flour','Cornmeal'] },
  { category: 'Staples & Grains', unit: 'kg', base: 85, names: ['Ragi Flour','Jowar Flour','Bajra Flour','Barley Flour','Millet Flour','Buckwheat Flour','Rajgira Flour','Soy Flour','Almond Flour','Coconut Flour'] },
  // --- Pulses, Dal & Beans ---
  { category: 'Pulses, Dal & Beans', unit: 'kg', base: 150, names: ['Toor Dal','Arhar Dal','Moong Dal','Yellow Moong Dal','Green Moong Dal','Whole Green Moong','Masoor Dal','Whole Masoor','Red Lentils'] },
  { category: 'Pulses, Dal & Beans', unit: 'kg', base: 130, names: ['Urad Dal','Whole Urad Dal','Dhuli Urad Dal','Chana Dal','Kabuli Chana','Kala Chana','Horse Gram','Moth Dal','Moth Beans'] },
  { category: 'Pulses, Dal & Beans', unit: 'kg', base: 180, names: ['Rajma','Kashmiri Rajma','Black Rajma','Black Beans','Pinto Beans','Kidney Beans','Adzuki Beans','Fava Beans','Lima Beans'] },
  { category: 'Pulses, Dal & Beans', unit: 'kg', base: 80, names: ['Lobia','White Peas','Dried Green Peas','Dried Yellow Peas','Soybeans','Black Eyed Peas','Chickpeas'] },
  { category: 'Pulses, Dal & Beans', unit: 'kg', base: 110, names: ['Matki','Mixed Dal','Five Lentil Mix','Sprouted Moong','Sprouted Chana','Green Lentils'] },
  // --- Sugar, Salt & Sweeteners ---
  { category: 'Sugar, Salt & Sweeteners', unit: 'kg', base: 45, names: ['Sugar','Brown Sugar','Powdered Sugar','Icing Sugar','Table Salt','Iodized Salt','Sea Salt','Low Sodium Salt','Kosher Salt','Baking Salt','Salt Substitute'] },
  { category: 'Sugar, Salt & Sweeteners', unit: 'kg', base: 70, names: ['Jaggery','Jaggery Powder','Coconut Sugar','Palm Sugar','Rock Sugar','Mishri'] },
  { category: 'Sugar, Salt & Sweeteners', unit: 'kg', base: 35, names: ['Rock Salt','Himalayan Pink Salt','Black Salt'] },
  // --- Cooking Oils & Ghee ---
  { category: 'Cooking Oils & Ghee', unit: 'liter', base: 140, names: ['Sunflower Oil','Soybean Oil','Rice Bran Oil','Vegetable Oil','Corn Oil','Safflower Oil','Canola Oil','Blended Cooking Oil'] },
  { category: 'Cooking Oils & Ghee', unit: 'liter', base: 165, names: ['Mustard Oil','Groundnut Oil','Coconut Oil','Sesame Oil','Palm Oil','Flaxseed Oil'] },
  { category: 'Cooking Oils & Ghee', unit: 'liter', base: 320, names: ['Olive Oil','Extra Virgin Olive Oil','Pomace Olive Oil','Avocado Oil'] },
  { category: 'Cooking Oils & Ghee', unit: 'kg', base: 380, names: ['Desi Ghee','Cow Ghee','Buffalo Ghee','Organic Ghee'] },
  { category: 'Cooking Oils & Ghee', unit: 'kg', base: 260, names: ['Butter','Salted Butter','Unsalted Butter','Clarified Butter'] },
  { category: 'Cooking Oils & Ghee', unit: 'piece', base: 180, names: ['Cooking Spray','Olive Oil Spray','Coconut Oil Spray','Mustard Oil Bottle'] },
  // --- Spices & Masalas ---
  { category: 'Spices & Masalas', unit: '100g', base: 55, names: ['Turmeric Powder','Red Chilli Powder','Kashmiri Chilli Powder','Coriander Powder','Cumin Powder','Garam Masala','Chaat Masala'] },
  { category: 'Spices & Masalas', unit: '100g', base: 180, names: ['Black Pepper','White Pepper','Black Pepper Powder','Nutmeg','Mace'] },
  { category: 'Spices & Masalas', unit: '100g', base: 40, names: ['Cumin Seeds','Coriander Seeds','Fennel Seeds','Fenugreek Seeds','Mustard Seeds','Ajwain','Carom Seeds','Nigella Seeds','Sesame Seeds','Poppy Seeds'] },
  { category: 'Spices & Masalas', unit: '50g', base: 120, names: ['Cardamom','Green Cardamom','Black Cardamom','Cinnamon','Cloves','Bay Leaf','Star Anise'] },
  { category: 'Spices & Masalas', unit: '100g', base: 65, names: ['Dry Ginger Powder','Asafoetida','Kasuri Methi'] },
  { category: 'Spices & Masalas', unit: '100g', base: 70, names: ['Kitchen King Masala','Chicken Masala','Mutton Masala','Biryani Masala','Pav Bhaji Masala','Chole Masala','Rajma Masala','Sambar Powder','Rasam Powder','Curry Powder','Tandoori Masala','Fish Masala','Tea Masala','Paneer Masala','Sabzi Masala','Dal Tadka Masala','Pav Bhaji Spice','Peri Peri Seasoning'] },
  // --- Sauces, Spreads & Condiments ---
  { category: 'Sauces, Spreads & Condiments', unit: 'piece', base: 75, names: ['Tomato Ketchup','Hot Tomato Ketchup','Chilli Sauce','Green Chilli Sauce','Red Chilli Sauce','Schezwan Sauce','Soy Sauce','Dark Soy Sauce','Light Soy Sauce','Vinegar','Apple Cider Vinegar','White Vinegar','Balsamic Vinegar','Mustard Sauce','English Mustard'] },
  { category: 'Sauces, Spreads & Condiments', unit: 'piece', base: 110, names: ['Mayonnaise','Eggless Mayonnaise','Garlic Mayonnaise','Mint Mayonnaise','Thousand Island Dressing','Ranch Dressing','Salad Dressing'] },
  { category: 'Sauces, Spreads & Condiments', unit: 'piece', base: 180, names: ['Peanut Butter','Crunchy Peanut Butter','Smooth Peanut Butter','Almond Butter','Cashew Butter','Chocolate Spread'] },
  { category: 'Sauces, Spreads & Condiments', unit: 'piece', base: 95, names: ['Strawberry Jam','Mixed Fruit Jam','Mango Jam','Orange Marmalade','Honey','Organic Honey','Maple Syrup','Date Syrup'] },
  { category: 'Sauces, Spreads & Condiments', unit: 'piece', base: 65, names: ['Chilli Pickle','Mango Pickle','Lemon Pickle','Mixed Pickle'] },
  // --- Biscuits, Cookies & Crackers ---
  { category: 'Biscuits, Cookies & Crackers', unit: 'piece', base: 30, names: ['Marie Biscuits','Glucose Biscuits','Salted Biscuits','Salt Crackers','Cream Crackers','Jeera Biscuits'] },
  { category: 'Biscuits, Cookies & Crackers', unit: 'piece', base: 45, names: ['Digestive Biscuits','Cream Biscuits','Chocolate Cream Biscuits','Bourbon Biscuits','Chocolate Biscuits','Oat Cookies','Almond Cookies','Cashew Cookies','Shortbread Cookies','Chocolate Chip Cookies','Ginger Cookies','Coconut Cookies'] },
  { category: 'Biscuits, Cookies & Crackers', unit: 'piece', base: 50, names: ['Butter Cookies','Multigrain Biscuits','Sugar-Free Biscuits','Ragi Biscuits','Digestive Oat Biscuits','Wafer Biscuits','Cheese Crackers'] },
  // --- Chips, Namkeen & Snacks ---
  { category: 'Chips, Namkeen & Snacks', unit: 'piece', base: 25, names: ['Potato Chips','Salted Potato Chips','Masala Potato Chips','Peri Peri Chips','Banana Chips','Tapioca Chips','Popcorn','Salted Popcorn','Butter Popcorn','Caramel Popcorn','Microwave Popcorn'] },
  { category: 'Chips, Namkeen & Snacks', unit: 'piece', base: 55, names: ['Nachos','Cheese Nachos','Tortilla Chips'] },
  { category: 'Chips, Namkeen & Snacks', unit: 'piece', base: 35, names: ['Bhujia','Aloo Bhujia','Sev','Nylon Sev','Mixture','Bombay Mix','Bikaneri Mixture','Moong Dal Namkeen','Chana Dal Namkeen'] },
  { category: 'Chips, Namkeen & Snacks', unit: 'piece', base: 45, names: ['Peanuts','Masala Peanuts','Roasted Chana','Roasted Makhana','Salted Makhana','Trail Mix','Protein Snack Mix'] },
  // --- Breakfast & Cereals ---
  { category: 'Breakfast & Cereals', unit: 'piece', base: 110, names: ['Chocolate Corn Flakes','Honey Corn Flakes','Chocos','Fruit & Nut Muesli','Chocolate Muesli','Oats Muesli','Honey Granola','Protein Granola','Bran Flakes'] },
  { category: 'Breakfast & Cereals', unit: 'piece', base: 65, names: ['Instant Poha','Instant Upma','Instant Oats','Masala Oats','Plain Oats'] },
  { category: 'Breakfast & Cereals', unit: 'piece', base: 140, names: ['Pancake Mix','Waffle Mix','Chocolate Pancake Mix','Breakfast Cereal Mix'] },
  // --- Noodles, Pasta & Instant Food ---
  { category: 'Noodles, Pasta & Instant Food', unit: 'piece', base: 30, names: ['Instant Noodles','Masala Noodles','Chicken Noodles','Cup Noodles','Rice Noodles','Hakka Noodles','Schezwan Noodles','Instant Ramen'] },
  { category: 'Noodles, Pasta & Instant Food', unit: 'piece', base: 70, names: ['Spaghetti','Penne Pasta','Fusilli Pasta','Macaroni','Farfalle Pasta','Lasagne Sheets','Whole Wheat Pasta','Multigrain Pasta','Vermicelli','Rice Vermicelli','Instant Pasta','Mac & Cheese'] },
  { category: 'Noodles, Pasta & Instant Food', unit: 'piece', base: 95, names: ['Pasta Sauce','Tomato Pasta Sauce','Arrabbiata Sauce','Alfredo Sauce','Pesto Sauce'] },
  // --- Tea, Coffee & Hot Drinks ---
  { category: 'Tea, Coffee & Hot Drinks', unit: '100g', base: 65, names: ['Assam Tea','Darjeeling Tea','Green Tea','Black Tea','Masala Tea','Ginger Tea','Lemon Tea','Herbal Tea','Chamomile Tea','Peppermint Tea','Earl Grey Tea','English Breakfast Tea'] },
  { category: 'Tea, Coffee & Hot Drinks', unit: '100g', base: 180, names: ['Instant Coffee','Filter Coffee','Ground Coffee','Arabica Coffee','Robusta Coffee','Cold Brew Coffee','Coffee Beans'] },
  { category: 'Tea, Coffee & Hot Drinks', unit: 'piece', base: 120, names: ['Hot Chocolate Powder'] },
  // --- Beverages ---
  { category: 'Beverages', unit: 'liter', base: 20, names: ['Mineral Water','Sparkling Water','Coconut Water'] },
  { category: 'Beverages', unit: 'liter', base: 65, names: ['Orange Juice','Apple Juice','Mango Juice','Mixed Fruit Juice','Pineapple Juice','Cranberry Juice','Tomato Juice','Lemonade','Iced Tea'] },
  { category: 'Beverages', unit: 'piece', base: 80, names: ['Cold Coffee','Chocolate Milk','Milkshake'] },
  { category: 'Beverages', unit: 'piece', base: 55, names: ['Energy Drink','Sports Drink','Electrolyte Drink','Ginger Ale','Tonic Water'] },
  // --- Dairy & Eggs ---
  { category: 'Dairy & Eggs', unit: 'liter', base: 28, names: ['Full Cream Milk','Toned Milk','Double Toned Milk','Skimmed Milk','A2 Milk','Organic Milk'] },
  { category: 'Dairy & Eggs', unit: 'liter', base: 55, names: ['Soy Milk','Almond Milk','Oat Milk','Coconut Milk'] },
  { category: 'Dairy & Eggs', unit: 'piece', base: 35, names: ['Buttermilk','Lassi','Sweet Lassi','Salted Lassi'] },
  { category: 'Dairy & Eggs', unit: 'piece', base: 45, names: ['Curd','Greek Yogurt','Plain Yogurt','Flavored Yogurt','Strawberry Yogurt','Mango Yogurt'] },
  { category: 'Dairy & Eggs', unit: 'piece', base: 75, names: ['Paneer','Low Fat Paneer','Tofu'] },
  { category: 'Dairy & Eggs', unit: 'piece', base: 120, names: ['Cheddar Cheese','Mozzarella Cheese','Processed Cheese','Cheese Slices','Cream Cheese','Parmesan Cheese'] },
  { category: 'Dairy & Eggs', unit: 'dozen', base: 72, names: ['Eggs'] },
  // --- Dry Fruits & Nuts ---
  { category: 'Dry Fruits & Nuts', unit: '200g', base: 320, names: ['Almonds','Cashews','Walnuts','Pistachios','Hazelnuts','Pecans','Macadamia Nuts','Brazil Nuts','Pine Nuts'] },
  { category: 'Dry Fruits & Nuts', unit: '200g', base: 140, names: ['Peanuts','Raisins','Black Raisins','Golden Raisins','Dates','Dried Figs','Dried Apricots','Dried Cranberries','Dried Blueberries','Dried Mango','Dried Coconut'] },
  { category: 'Dry Fruits & Nuts', unit: '200g', base: 180, names: ['Chia Seeds','Flax Seeds','Pumpkin Seeds','Sunflower Seeds','Hemp Seeds'] },
  // --- Bakery, Ready-to-Eat & Misc ---
  { category: 'Bakery, Ready-to-Eat & Misc', unit: 'piece', base: 35, names: ['White Bread','Brown Bread','Multigrain Bread','Whole Wheat Bread','Sandwich Bread','Pav'] },
  { category: 'Bakery, Ready-to-Eat & Misc', unit: 'piece', base: 65, names: ['Garlic Bread','Burger Buns','Hot Dog Buns','Pizza Base','Tortilla Wraps'] },
  { category: 'Bakery, Ready-to-Eat & Misc', unit: 'piece', base: 45, names: ['Roti','Paratha','Frozen Paratha','Frozen Peas','Frozen Corn','Frozen Mixed Vegetables','Frozen French Fries','Frozen Samosa','Frozen Spring Rolls'] },
  { category: 'Bakery, Ready-to-Eat & Misc', unit: 'piece', base: 55, names: ['Croissant','Instant Idli Mix','Instant Dosa Mix','Papad','Coconut Milk Powder'] },
  // === Vegetables & leafy greens ===
  { category: 'Root vegetables', unit: 'kg', base: 42, names: ['Potato','Baby Potato','Sweet Potato','Purple Sweet Potato','Sweet Potato White','Sweet Potato Orange','Sweet Potato Purple','Air Potato'] },
  { category: 'Root vegetables', unit: 'kg', base: 55, names: ['Yam','Elephant Foot Yam','Purple Yam','White Yam','Chinese Yam','Lesser Yam','Greater Yam','Suran','Arbi','Jimikand','Kachalu'] },
  { category: 'Root vegetables', unit: 'kg', base: 60, names: ['Tapioca','Cassava','Arrowroot','Taro Root','Colocasia Root'] },
  { category: 'Root vegetables', unit: 'kg', base: 45, names: ['Carrot','Baby Carrot','Red Carrot','Black Carrot','Beetroot','Golden Beetroot','Beetroot Red','Beetroot Golden','Beetroot Chioggia'] },
  { category: 'Root vegetables', unit: 'kg', base: 38, names: ['Radish','White Radish','Red Radish','Daikon','Turnip','Japanese Turnip','Kohlrabi','Parsnip','Rutabaga','Celeriac','Jerusalem Artichoke'] },
  { category: 'Onions and bulbs', unit: 'kg', base: 38, names: ['Onion','Red Onion','White Onion','Spring Onion','Shallot','Baby Onion','Pearl Onion','Sambar Onion'] },
  { category: 'Onions and bulbs', unit: 'kg', base: 120, names: ['Garlic','Green Garlic','Fresh Garlic','Garlic Flakes','Garlic Paste','Ginger Garlic Mix'] },
  { category: 'Onions and bulbs', unit: 'kg', base: 90, names: ['Ginger','Raw Turmeric','Leek','Fennel','Fennel Bulb'] },
  { category: 'Tomatoes', unit: 'kg', base: 48, names: ['Tomato','Cherry Tomato','Roma Tomato','Green Tomato','Yellow Tomato','Heirloom Tomato','Beefsteak Tomato','Plum Tomato','Grape Tomato','Yellow Cherry Tomato','Green Cherry Tomato','Desi Tomato','Hybrid Tomato','Cocktail Tomato'] },
  { category: 'Eggplant and okra', unit: 'kg', base: 50, names: ['Brinjal','Round Brinjal','Long Brinjal','Green Brinjal','Purple Brinjal','White Brinjal','Chinese Eggplant','Thai Eggplant','Japanese Eggplant','Okra','Red Okra','Ladies Finger','Bhindi Tender'] },
  { category: 'Capsicum and peppers', unit: '500g', base: 68, names: ['Bell Pepper','Green Capsicum','Red Capsicum','Yellow Capsicum','Orange Capsicum','Mini Capsicum','Green Peppers','Red Peppers','Yellow Peppers'] },
  { category: 'Capsicum and peppers', unit: '500g', base: 55, names: ['Green Chilli','Red Chilli','Jalapeno','Banana Pepper','Poblano Pepper','Serrano Pepper','Habanero Pepper','Thai Chilli','Long Pepper','Green Paprika'] },
  { category: 'Cucumbers and salad', unit: 'kg', base: 44, names: ['Cucumber','English Cucumber','Small Cucumber','Kakdi','Mini Cucumber','Persian Cucumber','Lebanese Cucumber','Japanese Cucumber','White Cucumber','Salad Cucumber'] },
  { category: 'Cucumbers and salad', unit: 'kg', base: 75, names: ['Zucchini','Yellow Zucchini','Yellow Squash','Chayote'] },
  { category: 'Gourds and squash', unit: 'kg', base: 46, names: ['Bottle Gourd','Round Bottle Gourd','Ridge Gourd','Sponge Gourd','Snake Gourd','Bitter Gourd','Baby Bitter Gourd','Ash Gourd','Pumpkin','Green Pumpkin','Yellow Pumpkin','Butternut Squash','Acorn Squash','Tinda','Pointed Gourd','Ivy Gourd','Chow Chow','Seem'] },
  { category: 'Beans and pods', unit: '500g', base: 52, names: ['French Beans','Broad Beans','Cluster Beans','Hyacinth Beans','Lima Beans','Runner Beans','Cowpeas','Edamame','Flat Beans','Green Beans','String Beans','Winged Bean','Velvet Bean','Guar Pods','Gawar','Sem Phali','Papdi','Val Papdi','Avarekai','Mochai'] },
  { category: 'Beans and pods', unit: '500g', base: 75, names: ['Snow Peas','Sugar Snap Peas','Fresh Peas','Fresh Chickpeas','Green Chickpeas','Fresh Pigeon Peas','Fresh Kidney Beans','Fresh Black Beans','Fresh Soybeans','Fresh Borlotti Beans','Fresh Lima Beans','Fresh Fava Beans','Fresh Peanuts','Horse Gram Pods'] },
  { category: 'Peas and corn', unit: '500g', base: 54, names: ['Green Peas','Corn','Baby Corn','Corn on Cob','Sweet Corn','Purple Corn','White Corn','Red Corn'] },
  { category: 'Mushrooms', unit: '200g', base: 72, names: ['Mushroom','Button Mushroom','Oyster Mushroom','Shiitake Mushroom','Enoki Mushroom','Portobello Mushroom'] },
  { category: 'Cruciferous vegetables', unit: 'kg', base: 55, names: ['Broccoli','Purple Broccoli','Cauliflower','Green Cauliflower','Romanesco','Baby Cauliflower','Cabbage','Red Cabbage','Savoy Cabbage','Napa Cabbage','Purple Cabbage','Bok Choy','Baby Bok Choy','Red Bok Choy','Brussels Sprouts','Kohlrabi','Chinese Broccoli','Chinese Cabbage'] },
  { category: 'Leafy vegetables', unit: '250g', base: 24, names: ['Spinach','Baby Spinach','Amaranth Leaves','Red Amaranth','Mustard Greens','Fenugreek Leaves','Coriander','Mint','Curry Leaves','Dill Leaves','Basil','Parsley','Celery','Rosemary','Thyme','Sage','Oregano','Lemongrass','Chives','Thai Basil'] },
  { category: 'Leafy vegetables', unit: '250g', base: 35, names: ['Kale','Green Kale','Red Kale','Baby Kale','Swiss Chard','Collard Greens','Beet Greens','Carrot Greens','Turnip Greens','Radish Greens','Mustard Leaves','Fenugreek Greens','Bathua Greens','Amaranth Greens','Malabar Spinach','Red Spinach','Poi Saag','Bathua','Chenopodium Greens','Chaulai','Sarson','Kulfa','Basella'] },
  { category: 'Leafy vegetables', unit: '250g', base: 45, names: ['Lettuce','Iceberg Lettuce','Romaine Lettuce','Butter Lettuce','Green Leaf Lettuce','Red Leaf Lettuce','Roman Lettuce','Frisee Lettuce','Radicchio','Chicory','Endive','Arugula','Watercress','Mizuna','Tatsoi','Komatsuna','Broccoli Rabe','Rapini','Sorrel','Sorrel Leaves','Water Spinach','Morning Glory','Napa Spinach'] },
  { category: 'Leafy vegetables', unit: '100g', base: 30, names: ['Curry Leaf Sprigs','Moringa Leaves','Gongura Leaves','Colocasia Leaves','Betel Leaves','Drumstick Leaves','Tamarind Leaves','Roselle Leaves','Purslane','Agathi Leaves','Pumpkin Leaves','Sweet Potato Leaves','Taro Leaves'] },
  { category: 'Specialty vegetables', unit: '500g', base: 120, names: ['Asparagus','Artichoke','Bamboo Shoots','Bean Sprouts','Alfalfa Sprouts','Methi Sprouts','Radish Sprouts','Mustard Sprouts'] },
  { category: 'Specialty vegetables', unit: 'kg', base: 65, names: ['Lotus Root','Lotus Stem','Water Chestnut','Raw Papaya','Raw Banana','Raw Jackfruit','Drumstick','Moringa Pods','Banana Flower','Banana Stem','Pumpkin Flower','Zucchini Flower','Bottle Gourd Flower','Ridge Gourd Flower'] },
  { category: 'Indian regional vegetables', unit: 'kg', base: 55, names: ['Kachri','Kakora','Kantola','Teasel Gourd','Karela Baby','Parwal','Kundru'] },
  { category: 'Indian regional vegetables', unit: 'kg', base: 70, names: ['Taro','Purple Yam','White Yam','Chinese Yam','Suran','Arbi','Jimikand','Kachalu'] },
  // === Fruits ===
  { category: 'Apples', unit: 'kg', base: 168, names: ['Apple','Red Apple','Green Apple','Royal Gala Apple','Fuji Apple','Granny Smith Apple','Pink Lady Apple','Washington Apple','Ambri Apple','Kinnaur Apple'] },
  { category: 'Bananas', unit: 'dozen', base: 62, names: ['Banana','Robusta Banana','Cavendish Banana','Yelakki Banana','Nendran Banana','Red Banana','Plantain','Rasthali Banana','Poovan Banana'] },
  { category: 'Mangoes', unit: 'kg', base: 142, names: ['Mango','Alphonso Mango','Kesar Mango','Dasheri Mango','Langra Mango','Chausa Mango','Totapuri Mango','Banganapalli Mango','Himsagar Mango','Safeda Mango','Malgova Mango','Sindhura Mango','Amrapali Mango','Neelam Mango','Raspuri Mango'] },
  { category: 'Citrus fruit', unit: 'kg', base: 92, names: ['Orange','Valencia Orange','Nagpur Orange','Kinnow','Mandarin','Tangerine','Blood Orange','Sweet Lime','Lemon','Meyer Lemon','Lime','Mosambi','Grapefruit','Pomelo','Persian Lime'] },
  { category: 'Tropical fruits', unit: 'kg', base: 85, names: ['Guava','Pink Guava','White Guava','Pear','Asian Pear','Bartlett Pear','Green Pear','Red Pear'] },
  { category: 'Tropical fruits', unit: 'piece', base: 78, names: ['Papaya','Red Lady Papaya','Pineapple','Baby Pineapple','Dragon Fruit','Red Dragon Fruit','White Dragon Fruit','Dragon Fruit Yellow','Avocado','Hass Avocado','Fuerte Avocado','Kiwi','Golden Kiwi','Green Kiwi','Kiwi Berry'] },
  { category: 'Tropical fruits', unit: 'piece', base: 65, names: ['Coconut','Tender Coconut','Chikoo','Sapota','Custard Apple','Sitaphal','Ramphal','Soursop','Cherimoya','Jackfruit','Raw Jackfruit','Breadfruit','Lychee','Rambutan','Longan','Mangosteen','Mangosteen Purple','Durian','Passion Fruit','Star Fruit','Carambola'] },
  { category: 'Melons and grapes', unit: 'kg', base: 86, names: ['Watermelon','Yellow Watermelon','Muskmelon','Cantaloupe','Honeydew Melon','Grapes','Green Grapes','Red Grapes','Black Grapes','Thompson Seedless Grapes','Flame Seedless Grapes','Concord Grapes'] },
  { category: 'Berries', unit: '250g', base: 178, names: ['Strawberry','Blueberry','Raspberry','Blackberry','Cranberry','Mulberry','White Mulberry','Black Mulberry','Red Mulberry','Gooseberry','Indian Gooseberry','Amla','Cape Gooseberry','Golden Berry','Blackcurrant','Redcurrant','Whitecurrant','Elderberry','Boysenberry','Loganberry','Gooseberry Green','Gooseberry Red'] },
  { category: 'Stone fruits', unit: '500g', base: 118, names: ['Peach','White Peach','Nectarine','Plum','Black Plum','Red Plum','Apricot','Cherry','Sweet Cherry','Sour Cherry'] },
  { category: 'Stone fruits', unit: '500g', base: 95, names: ['Fig','Fresh Fig','Fig Green','Fig Black','Date','Fresh Dates','Persimmon','Persimmon Fuyu','Persimmon Hachiya'] },
  { category: 'Exotic fruits', unit: 'kg', base: 120, names: ['Pomegranate','Red Pomegranate','Quince','Loquat','Medlar','Miracle Fruit','Feijoa','Kiwano','Horned Melon','Tamarillo','White Sapote','Black Sapote','Mamey Sapote','Canistel','Lucuma','Ackee','Jabuticaba','Langsat','Pulasan','Santol','Salak Fruit','Kei Apple','Noni Fruit','Bilimbi','Ambarella','Hog Plum','June Plum','Cempedak','Marang','Breadnut','Mammee Apple','Malay Apple','Bignay'] },
  { category: 'Exotic fruits', unit: 'kg', base: 90, names: ['Jamun','Karonda','Ber','Indian Jujube','Bael','Wood Apple','Kokum','Phalsa','Tamarind','Raw Tamarind','Elephant Apple','Star Gooseberry','Barbados Cherry','Acerola','Water Apple','Wax Apple','Java Apple','Rose Apple','Snake Fruit','Salak'] },
];

// Deduplicate (name, unit) — keep first occurrence
const seen = new Set();
const uniqueGroups = [];
for (const g of groups) {
  const uniqueNames = [];
  for (const n of g.names) {
    const key = n + '|' + g.unit;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueNames.push(n);
    }
  }
  if (uniqueNames.length > 0) {
    uniqueGroups.push({ ...g, names: uniqueNames });
  }
}

const totalCount = uniqueGroups.reduce((sum, g) => sum + g.names.length, 0);

// Build VALUES for the CTE: (name, category, unit, base_price)
const valuesRows = [];
for (const g of uniqueGroups) {
  for (const name of g.names) {
    const eName = name.replace(/'/g, "''");
    const eCat = g.category.replace(/'/g, "''");
    const eUnit = g.unit.replace(/'/g, "''");
    valuesRows.push(`  ('${eName}', '${eCat}', '${eUnit}', ${g.base}::numeric)`);
  }
}

const sql = `/*
# Expand product catalog to comprehensive grocery list

1. Changes
- Upserts ${totalCount} grocery products spanning staples, grains, pulses, oils, spices, sauces, biscuits, snacks, cereals, noodles, tea, coffee, beverages, dairy, dry fruits, bakery, vegetables, leafy greens, fruits, and regional Indian produce.
- Each product has a name, category, unit, and four deterministic source prices (BigBasket, Blinkit, Zepto, Swiggy Instamart).
- Prices are generated from category base prices and a stable hash of the product name, so the same product always returns the same prices.
2. Idempotency
- Uses ON CONFLICT (name, unit) DO UPDATE so re-running updates existing products without creating duplicates.
3. Security
- No policy changes. The products table remains publicly readable (anon + authenticated).
*/

WITH seed_data(name, category, unit, base_price) AS (
  VALUES
${valuesRows.join(',\n')}
), priced AS (
  SELECT name, category, unit,
    round(base_price * (1 + (((abs(hashtext(name)) % 5) - 2) * 0.025)), 2) AS base,
    abs(hashtext(name)) AS product_hash
  FROM seed_data
)
INSERT INTO public.products (name, category, unit, source_prices)
SELECT name, category, unit,
  jsonb_build_array(
    jsonb_build_object('source', 'BigBasket', 'price', round(base * (CASE WHEN product_hash % 17 = 0 THEN 0.86 ELSE 1 + (((product_hash % 5) - 2) * 0.018) END), 2)),
    jsonb_build_object('source', 'Blinkit', 'price', round(base * (CASE WHEN product_hash % 19 = 0 THEN 0.90 ELSE 1 + ((abs(hashtext(name || 'coupon')) % 7 - 3) * 0.015) END), 2)),
    jsonb_build_object('source', 'Zepto', 'price', round(base * (CASE WHEN product_hash % 23 = 0 THEN 0.83 ELSE 1 + ((abs(hashtext(name || 'cashback')) % 5 - 2) * 0.02) END), 2)),
    jsonb_build_object('source', 'Swiggy Instamart', 'price', round(base * (CASE WHEN product_hash % 29 = 0 THEN 1.10 ELSE 1 + ((abs(hashtext(name || 'card')) % 7 - 3) * 0.018) END), 2))
  )
FROM priced
ON CONFLICT (name, unit) DO UPDATE SET
  category = EXCLUDED.category,
  source_prices = EXCLUDED.source_prices;
`;

writeFileSync('/tmp/cc-agent/69961548/project/tmp_seed.sql', sql);
console.log(`Generated SQL with ${totalCount} products across ${uniqueGroups.length} groups.`);
