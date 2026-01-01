import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ShoppingCart, 
  Coffee,
  Package, 
  Heart, 
  Clock, 
  Award,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useProducts } from '../contexts/ProductsContext';
import { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const { products: menuProducts } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Responsive slides calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else if (window.innerWidth < 1280) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [currentSlide, menuProducts.length, slidesToShow]);

  // Handle infinite loop seamlessly
  useEffect(() => {
    if (currentSlide === menuProducts.length) {
      // When we reach the cloned first item, instantly jump to the real first item
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 500); // Wait for transition to complete
      
      setTimeout(() => {
        setIsTransitioning(true);
      }, 550); // Re-enable transition
    } else if (currentSlide === -1) {
      // When we reach the cloned last item, instantly jump to the real last item
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(menuProducts.length - 1);
      }, 500);
      
      setTimeout(() => {
        setIsTransitioning(true);
      }, 550);
    }
  }, [currentSlide, menuProducts.length]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  };

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setCurrentSlide(index);
  };

  const features = [
    {
      icon: Sparkles,
      title: "Freshly Baked Daily",
      description: "All our products are baked fresh every morning using traditional methods and premium ingredients."
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every item is handcrafted with care and passion by our skilled bakers who love what they do."
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "We use only the finest organic flour, natural ingredients, and authentic matcha powder."
    },
    {
      icon: Coffee,
      title: "Matcha Specialties",
      description: "Our signature matcha-infused pastries and breads are unique and absolutely delicious."
    },
    {
      icon: Clock,
      title: "Open Early",
      description: "Start your day right! We open at 6 AM to serve you the freshest breakfast treats."
    },
    {
      icon: Package,
      title: "Custom Orders",
      description: "Need something special? We offer custom cakes and catering for your events."
    }
  ];

  const products = [
    {
      name: "Matcha Croissant",
      description: "Buttery, flaky croissant with premium matcha",
      color: "from-emerald-400 to-green-500"
    },
    {
      name: "Artisan Sourdough",
      description: "Crusty outside, soft inside, naturally fermented",
      color: "from-green-400 to-emerald-500"
    },
    {
      name: "Matcha Cheesecake",
      description: "Creamy and rich with authentic Japanese matcha",
      color: "from-lime-400 to-green-500"
    },
    {
      name: "Green Tea Cookies",
      description: "Crispy, buttery cookies with matcha swirl",
      color: "from-teal-400 to-cyan-500"
    },
    {
      name: "Whole Grain Bread",
      description: "Healthy and hearty with seeds and grains",
      color: "from-emerald-500 to-green-600"
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-green-900">Matcha Bakery</h1>
                <p className="text-sm text-green-600">Fresh Daily Since 2020</p>
              </div>
            </div>
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Order Online
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Rotating Product Banner */}
      <section className="bg-white border-b border-green-200 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-green-900 mb-2">
              Today's Fresh Selection
            </h2>
            <p className="text-green-600">
              Discover our delicious menu items, baked fresh daily
            </p>
          </div>
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-green-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-green-600" />
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden mx-12">
              <div
                className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                style={{
                  transform: `translateX(-${(currentSlide * 100) / slidesToShow}%)`
                }}
              >
                {menuProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / slidesToShow}%` }}
                  >
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl">
                      <div className="relative h-64 overflow-hidden group">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </div>
                        {product.rating && (
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-4 h-4 fill-green-500 text-green-500" />
                            <span className="text-sm text-green-900">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-green-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-green-600 mb-4 line-clamp-2 h-10">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl text-green-900">
                            ${product.price.toFixed(2)}
                          </span>
                          <Button
                            onClick={onGetStarted}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            Order Now
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Clone first slidesToShow items at the end for seamless loop */}
                {menuProducts.slice(0, slidesToShow).map((product) => (
                  <div
                    key={`clone-end-${product.id}`}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / slidesToShow}%` }}
                  >
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl">
                      <div className="relative h-64 overflow-hidden group">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </div>
                        {product.rating && (
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-4 h-4 fill-green-500 text-green-500" />
                            <span className="text-sm text-green-900">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-green-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-green-600 mb-4 line-clamp-2 h-10">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl text-green-900">
                            ${product.price.toFixed(2)}
                          </span>
                          <Button
                            onClick={onGetStarted}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            Order Now
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.max(1, menuProducts.length - slidesToShow + 1) }).map((_, index) => {
                // Normalize currentSlide to handle infinite loop
                const normalizedSlide = currentSlide >= menuProducts.length ? 0 : currentSlide < 0 ? menuProducts.length - 1 : currentSlide;
                
                return (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      normalizedSlide === index
                        ? 'bg-green-600 w-8'
                        : 'bg-green-300 hover:bg-green-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full border border-green-200">
                🍃 Organic • Fresh • Delicious
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl text-green-900 leading-tight">
              Artisan Bakery with a <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Matcha Twist</span>
            </h1>
            <p className="text-xl text-green-700">
              Welcome to Matcha Bakery, where traditional baking meets Japanese-inspired flavors. Every morning, we bake fresh breads, pastries, and our signature matcha treats using premium ingredients and time-honored techniques.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Order Now
                <ShoppingCart className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-green-600 text-green-700 hover:bg-green-50"
              >
                View Menu
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Daily Fresh</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Organic Ingredients</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Handcrafted</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1592637970552-6c27432e7913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBiYWtlcnklMjBjYWZlfGVufDF8fHx8MTc2NDg1MzcyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Matcha Bakery Interior"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-green-900 mb-4">
              Why Choose Matcha Bakery?
            </h2>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Experience the perfect blend of tradition and innovation in every bite
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-green-900 mb-2">{feature.title}</h3>
                  <p className="text-green-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-green-900 mb-4">
              Our Signature Selection
            </h2>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Discover our most popular items, loved by the community
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100"
              >
                <div className={`bg-gradient-to-br ${product.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-green-900 text-center mb-2">{product.name}</h3>
                <p className="text-green-600 text-center text-sm">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl text-green-900 mb-4">
                  Baked Fresh Every Morning
                </h2>
                <p className="text-xl text-green-600">
                  Step into our bakery and experience the aroma of freshly baked bread, the warmth of our ovens, and the smiles of our dedicated team.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <h4 className="text-green-900">Open Daily</h4>
                  </div>
                  <p className="text-green-600 text-sm">6 AM - 8 PM</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h4 className="text-green-900">Location</h4>
                  </div>
                  <p className="text-green-600 text-sm">Downtown District</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    <h4 className="text-green-900">Call Us</h4>
                  </div>
                  <p className="text-green-600 text-sm">(555) 123-4567</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <h4 className="text-green-900">Email</h4>
                  </div>
                  <p className="text-green-600 text-sm">hello@matcha.cafe</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1555932450-31a8aec2adf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyZWFkJTIwYmFrZXJ5fGVufDF8fHx8MTc2NDc1NTk0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Fresh Bread"
                  className="w-full h-[250px] object-cover"
                />
              </div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1741092966238-4302f0d98576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwcGFzdHJpZXN8ZW58MXx8fHwxNzY0ODU0MDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Artisan Pastries"
                  className="w-full h-[250px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl lg:text-5xl text-white">
              Ready to Taste the Difference?
            </h2>
            <p className="text-xl text-green-100">
              Visit us today or order online for pickup. Your taste buds will thank you!
            </p>
            <div className="pt-4">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-white text-green-700 hover:bg-green-50 shadow-2xl hover:shadow-3xl transition-all text-lg px-8"
              >
                Order Online Now
                <ShoppingCart className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-green-100 text-sm">
              Open Daily 6 AM - 8 PM • Downtown District • Free Parking Available
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white">Matcha Bakery</h3>
                <p className="text-sm text-green-300">Fresh Daily Since 2020</p>
              </div>
            </div>
            <div className="text-green-300 text-sm">
              © 2025 Matcha Bakery. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}