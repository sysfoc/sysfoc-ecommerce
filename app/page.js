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

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-white">
//       <nav className="border-b border-gray-200 px-4 py-3">
//         <div className="max-w-4xl mx-auto flex justify-between items-center">
//           <h1 className="text-lg font-semibold text-gray-900">Ecommerce</h1>
//           <div className="flex gap-4">
//             <a href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">
//               Sign In
//             </a>
//             <a href="/sign-up" className="text-sm bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-800">
//               Sign Up
//             </a>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-4xl mx-auto px-4 py-12">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Our Store</h2>
//           <p className="text-gray-600 mb-8">Sign in to access your account and start shopping.</p>
//           <div className="flex gap-4 justify-center">
//             <a href="/sign-in" className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800">
//               Get Started
//             </a>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }
