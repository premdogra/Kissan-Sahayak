import matplotlib.pyplot as plt
from io import BytesIO


def generate_price_graph(data, market, commodity):

    dates = [d["date"] for d in data]
    prices = [d["price"] for d in data]

    plt.figure(figsize=(8,5))
    plt.plot(dates, prices, marker="o")

    plt.title(f"{commodity} Price Trend\n{market}")
    plt.xlabel("Date")
    plt.ylabel("Modal Price (₹)")
    plt.grid(True)

    img = BytesIO()
    plt.savefig(img, format="png")
    img.seek(0)

    plt.close()

    return img