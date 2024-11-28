import Slider from "./components/Slider";
import ProductList from "./components/ProductList";
import Products from "./components/Products";

export default function Home() {
  return (
    <div className="">
      <Slider/>
      <div className="my-10 md:my-20 flex justify-center items-center">
          <div className="w-full sm:w-[75%] text-center">
            <p><strong>Akbar Aslam</strong> is a luxury womens ethnic brand that combines modern aesthetic with age-old traditions. Our handcrafted and hand-embellished dresses are made by master craftsmen, ensuring the highest quality and commitment to our customers.</p>
            <h3 className="font-semibold my-5">International Customers Updates:</h3>
            <p>No Tax or Import Duties. Parcels will be shipped from local UK center with new reduced shipping rate.</p>
          </div>
      </div>
      <ProductList/>
      <Products/>
    </div>
  );
}
