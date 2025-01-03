import csv
import random
from datetime import datetime, timedelta

from faker import Faker

fake = Faker('fr_FR')


def generate_orders_and_products(num_orders, num_products, start_order_id=1, start_product_id=1):
    orders = []
    products = []

    statuses = ["en cours", "annulée", "livrée"]
    categories = ["fruit", "légume", "boisson", "snack", "véhicule", "armement"]
    product_names = {
        "fruit": "Pomme",
        "légume": "Carotte",
        "boisson": "Jus d'orange",
        "snack": "Chips",
        "véhicule": ["Voiture", "Train", "Avion", "Tank", "Fusée", "Vaisseau spatial"],
        "armement": ["Missile", "Canon", "Lance-roquettes"]
    }
    descriptions = {
        "fruit": "Un fruit croquant et juteux parfait pour les collations.",
        "légume": "Un légume frais pour toutes vos recettes saines.",
        "boisson": "Une boisson rafraîchissante et naturelle.",
        "snack": "Un snack croustillant pour toutes les occasions.",
        "véhicule": "Un véhicule performant pour tous vos besoins de transport.",
        "armement": "Un équipement de pointe pour votre sécurité et défense."
    }

    base_date = datetime(2023, 1, 1)

    for order_id in range(start_order_id, start_order_id + num_orders):
        date = base_date + timedelta(days=(order_id - start_order_id) * 3, hours=random.randint(0, 23),
                                     minutes=random.randint(0, 59), seconds=random.randint(0, 59))
        status = random.choice(statuses)
        address = fake.address().replace("\n", ", ")

        orders.append({
            "order_id": order_id,
            "address": address,
            "date": date.strftime("%Y-%m-%d %H:%M:%S"),
            "status": status
        })

        # Ensure each order has at least one product
        num_products_for_order = random.randint(1, 5)
        for _ in range(num_products_for_order):
            category = random.choice(categories)
            name = random.choice(product_names[category]) if isinstance(product_names[category], list) else \
            product_names[category]
            products.append({
                "product_id": start_product_id,
                "order_id": order_id,
                "category": category,
                "name": name,
                "description": descriptions[category],
                "price": round(random.uniform(1.0, 20000.0), 2) if category in ["véhicule", "armement"] else round(
                    random.uniform(1.0, 20.0), 2)
            })
            start_product_id += 1

    return orders, products


def write_to_csv(orders, products):
    with open("orders_dragdrop.csv", "w", newline="", encoding="utf-8") as orders_file:
        orders_writer = csv.DictWriter(orders_file, fieldnames=["order_id", "address", "date", "status"])
        orders_writer.writeheader()
        orders_writer.writerows(orders)

    with open("products_dragdrop.csv", "w", newline="", encoding="utf-8") as products_file:
        products_writer = csv.DictWriter(products_file,
                                         fieldnames=["product_id", "order_id", "category", "name", "description",
                                                     "price"])
        products_writer.writeheader()
        products_writer.writerows(products)


def main():
    num_orders = 100  # Adjust the number of orders as needed
    num_products = 50  # Adjust the number of unique products as needed
    start_order_id = 1000  # Starting order ID
    start_product_id = 1000  # Starting product ID

    orders, products = generate_orders_and_products(num_orders, num_products, start_order_id, start_product_id)
    write_to_csv(orders, products)


if __name__ == "__main__":
    main()
