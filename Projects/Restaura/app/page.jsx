import About from "@components/About";
import Footer from "@components/Footer";
import Header from "@components/Header";
import Hero from "@components/Hero";
import Map from "@components/Map";
import Menu from "@components/Menu";
import Reservation from "@components/Reservation";

export default function Home() {
   return (
      <main
         className="w-full max-w-[1440px] bg-white mx-auto overflow-hidden"
         id="root"
      >
         <Header />
         <Hero />
         <Menu />
         <Reservation />
         <About />
         <Map />
         <Footer />
      </main>
   );
}
