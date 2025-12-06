"""
Seed 1000 sensible ingredients (curated by category with safe modifiers)

Revision ID: 20251018_1k_ingredient_import
Revises: 20251018_seed_1k_ingredients
Create Date: 2025-10-18 18:05:00
"""
from alembic import op
import sqlalchemy as sa

# --- Alembic IDs ---
revision = "20251018_1k_ingredient_import"
down_revision = "20251018_seed_1k_ingredients"
branch_labels = None
depends_on = None

# -----------------------
# Kurált alapkészlet
# -----------------------

LIQUIDS = [
    "Water","Olive oil","Vegetable oil","Sunflower oil","Coconut oil","Sesame oil",
    "Milk","Whole milk","Skim milk","Evaporated milk","Condensed milk",
    "Cream","Heavy cream","Whipping cream","Sour cream","Yogurt","Greek yogurt","Kefir","Buttermilk",
    "Coconut milk","Almond milk","Soy milk","Oat milk",
    "Chicken broth","Beef broth","Vegetable broth","Bone broth","Dashi","Stock",
    "Orange juice","Lemon juice","Apple juice","Tomato juice","Vinegar","Apple cider vinegar",
    "Balsamic vinegar","Rice vinegar","Red wine vinegar","White wine vinegar",
    "Soy sauce","Light soy sauce","Dark soy sauce","Worcestershire sauce","Fish sauce","Oyster sauce",
]

VEGETABLES = [
    "Onion","Red onion","White onion","Shallot","Spring onion","Leek","Garlic","Carrot","Potato","Sweet potato",
    "Tomato","Cherry tomato","Cucumber","Zucchini","Eggplant","Bell pepper","Green bell pepper","Red bell pepper",
    "Yellow bell pepper","Chili pepper","Jalapeno","Habanero","Broccoli","Cauliflower","Spinach","Lettuce","Romaine",
    "Kale","Arugula","Cabbage","Red cabbage","Savoy cabbage","Brussels sprouts","Peas","Green beans","Snow peas",
    "Corn","Celery","Celeriac","Mushroom","Button mushroom","Portobello mushroom","Oyster mushroom","Shiitake",
    "King oyster mushroom","Pumpkin","Butternut squash","Radish","Daikon","Turnip","Parsnip","Beetroot","Asparagus",
    "Artichoke","Okra","Avocado","Fennel","Bok choy","Chard","Endive",
]

FRUITS = [
    "Apple","Green apple","Banana","Orange","Lemon","Lime","Grapefruit","Mandarin","Pineapple","Mango","Papaya",
    "Guava","Pomegranate","Peach","Nectarine","Plum","Apricot","Cherry","Strawberry","Raspberry","Blueberry",
    "Blackberry","Cranberry","Grapes","Kiwi","Watermelon","Cantaloupe","Honeydew melon","Fig","Date","Prune","Pear",
    "Passion fruit","Dragon fruit","Coconut",
]

MEATS = [
    "Chicken breast","Chicken thigh","Chicken wings","Chicken drumstick","Whole chicken","Ground chicken",
    "Turkey breast","Ground turkey","Duck breast","Beef steak","Ground beef","Beef ribs","Beef brisket",
    "Pork loin","Pork chop","Ground pork","Ham","Bacon","Sausage","Salami","Lamb leg","Lamb chop","Veal","Rabbit",
    "Venison",
]

SEAFOOD = [
    "Tuna","Salmon","Cod","Haddock","Trout","Mackerel","Sardine","Anchovy","Herring",
    "Shrimp","Prawn","Crab","Lobster","Mussel","Clam","Oyster","Squid","Octopus",
]

GRAINS_PASTA = [
    "Flour","All-purpose flour","Bread flour","Cake flour","Whole wheat flour","Corn flour","Rice flour","Semolina",
    "Cornmeal","Almond flour","Oat flour","Buckwheat flour","Quinoa","Couscous","Bulgur","Millet",
    "Rice","White rice","Brown rice","Jasmine rice","Basmati rice","Wild rice",
    "Pasta","Spaghetti","Penne","Fusilli","Macaroni","Lasagna sheets","Noodles","Rice noodles","Udon","Soba","Ramen",
    "Tortilla","Pita bread","Breadcrumbs","Yeast","Baking powder","Baking soda",
]

LEGUMES_NUTS_SEEDS = [
    "Lentil","Red lentil","Brown lentil","Green lentil","Chickpea","Kidney bean","Black bean","White bean","Soybean",
    "Peanut","Walnut","Almond","Hazelnut","Cashew","Pistachio","Macadamia","Pine nut","Sunflower seed","Pumpkin seed",
    "Sesame seed","Chia seed","Flaxseed",
]

SPICES_HERBS = [
    "Salt","Sugar","Brown sugar","Powdered sugar","Black pepper","White pepper","Paprika","Sweet paprika",
    "Smoked paprika","Cayenne pepper","Curry powder","Turmeric","Cumin","Coriander seed","Mustard seed","Caraway",
    "Fennel seed","Fenugreek","Garam masala","Chinese five-spice","Oregano","Basil","Thyme","Rosemary","Parsley",
    "Dill","Bay leaf","Marjoram","Sage","Tarragon","Mint","Cinnamon","Nutmeg","Clove","Cardamom",
    "Ginger","Ginger powder","Garlic powder","Onion powder","Vanilla","Vanilla extract","Almond extract",
    "Lemon zest","Orange zest","Cocoa powder",
]

SAUCES_CONDIMENTS = [
    "Tomato paste","Tomato sauce","Crushed tomato","Ketchup","Mayonnaise","Mustard","Dijon mustard","Horseradish",
    "Teriyaki sauce","BBQ sauce","Hot sauce","Sriracha","Chili oil","Miso paste","Tahini","Peanut butter","Maple syrup",
    "Honey","Molasses","Jam","Chocolate syrup","Pesto","Hummus",
]

DAIRY_CHEESE = [
    "Mozzarella","Cheddar","Parmesan","Grana Padano","Gouda","Edam","Emmental","Gruyere","Feta","Goat cheese",
    "Cream cheese","Ricotta","Cottage cheese","Blue cheese","Camembert","Brie","Mascarpone","Halloumi",
]

BAKING_MISC = [
    "Corn starch","Potato starch","Gelatin","Pectin","Agar agar","Chocolate","Dark chocolate","White chocolate",
    "Coffee","Black tea","Green tea",
]

# -----------------------
# Engedélyezett jelzők kategóriánként (max 1 jelző / név)
# -----------------------
ALLOWED_MODS = {
    "LIQUIDS": [""],  # folyadékokhoz ne tegyünk jelzőt
    "VEGETABLES": ["", "fresh", "frozen", "dried", "chopped", "sliced"],
    "FRUITS": ["", "fresh", "frozen", "dried"],
    "MEATS": ["", "ground", "boneless", "skinless", "smoked", "sliced"],
    "SEAFOOD": ["", "fresh", "frozen", "smoked"],
    "GRAINS_PASTA": ["", "cooked", "uncooked", "whole"],
    "LEGUMES_NUTS_SEEDS": ["", "dried", "toasted", "roasted"],
    "SPICES_HERBS": ["", "fresh", "dried", "ground"],
    "SAUCES_CONDIMENTS": [""],  # mártásoknál megtartjuk az alapnevet
    "DAIRY_CHEESE": ["", "grated", "shredded", "sliced"],
    "BAKING_MISC": [""],
}

CATEGORIES = [
    ("LIQUIDS", LIQUIDS),
    ("VEGETABLES", VEGETABLES),
    ("FRUITS", FRUITS),
    ("MEATS", MEATS),
    ("SEAFOOD", SEAFOOD),
    ("GRAINS_PASTA", GRAINS_PASTA),
    ("LEGUMES_NUTS_SEEDS", LEGUMES_NUTS_SEEDS),
    ("SPICES_HERBS", SPICES_HERBS),
    ("SAUCES_CONDIMENTS", SAUCES_CONDIMENTS),
    ("DAIRY_CHEESE", DAIRY_CHEESE),
    ("BAKING_MISC", BAKING_MISC),
]

TARGET = 1000

def _titlecase(s: str) -> str:
    # normál címkeformázás (pl. "BBQ sauce" marad nagybetűs rövidítéssel)
    specials = {"BBQ": "BBQ", "Dashi": "Dashi"}
    out = " ".join(w.capitalize() if w.upper() not in specials else specials[w.upper()]
                   for w in s.split())
    return out

def _generate_sensible_names():
    names = []
    for cat_key, base_list in CATEGORIES:
        mods = ALLOWED_MODS[cat_key]
        for base in base_list:
            for mod in mods:
                if not mod:
                    names.append(_titlecase(base))
                else:
                    # pontosan 1, kategóriához illő jelző
                    names.append(_titlecase(f"{mod} {base}"))
    # egyediesítés és rendezés
    uniq = []
    seen = set()
    for n in names:
        if len(n) > 150:
            n = n[:150]
        if n not in seen:
            seen.add(n)
            uniq.append(n)
    # ha túl sok, vágjuk 1000-re; ha kevés, az alaplistákat lehet bővíteni
    if len(uniq) < TARGET:
        raise RuntimeError(f"Only generated {len(uniq)} sensible names; extend base lists to reach {TARGET}.")
    return uniq[:TARGET]

INGREDIENTS = _generate_sensible_names()

def upgrade():
    conn = op.get_bind()
    # biztos ami biztos: legyen UNIQUE az ingredients.name (ha még nincs)
    try:
        op.create_unique_constraint("uq_ingredients_name", "ingredients", ["name"])
    except Exception:
        pass

    stmt = sa.text(
        "INSERT INTO ingredients (name) VALUES (:name) "
        "ON DUPLICATE KEY UPDATE name = VALUES(name)"
    )
    # batch insert
    for name in INGREDIENTS:
        conn.execute(stmt, {"name": name})

def downgrade():
    conn = op.get_bind()
    stmt = sa.text("DELETE FROM ingredients WHERE name = :name")
    for name in INGREDIENTS:
        conn.execute(stmt, {"name": name})
    # az UNIQUE constraint maradhat; ha mindenképp el akarod távolítani, kommentezd ki:
    # op.drop_constraint("uq_ingredients_name", "ingredients", type_="unique")