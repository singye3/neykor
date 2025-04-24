// client/src/components/home/ImageCarousel.tsx
"use client";

// Keep React and Swiper imports
import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Keep Swiper CSS imports
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// Define the expected structure of an image object from the API
interface CarouselImage {
    id: string;
    src: string;
    alt: string;
}

const ImageCarousel = () => {
    const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]); // State for images
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state

    useEffect(() => {
        // Function to fetch images
        const fetchImages = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch from your backend API endpoint
                // ** IMPORTANT: Ensure this URL is correct **
                // If client/server run on different ports, use the full URL
                // Consider using environment variables for API base URL
                const response = await fetch('http://localhost:5000/api/carousel-images'); // Use full URL

                if (!response.ok) {
                     // Try to get error message from backend response
                    const errorData = await response.json().catch(() => ({})); // Catch if response isn't JSON
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const data: CarouselImage[] = await response.json();
                setCarouselImages(data);

            } catch (err: any) {
                console.error("Failed to fetch carousel images:", err);
                setError(err.message || 'Failed to load images.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages(); // Call the fetch function when component mounts
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Conditional Rendering based on state ---

    if (isLoading) {
        return (
            <section className="py-12 md:py-16 bg-parchment-dark textile-texture-bg flex justify-center items-center min-h-[300px]">
                <p className="text-charcoal text-xl">Loading Journeys...</p>
                {/* You could add a spinner here */}
            </section>
        );
    }

    if (error) {
        return (
             <section className="py-12 md:py-16 bg-red-100 border border-red-400 text-red-700 px-4 flex justify-center items-center min-h-[300px]">
                <p className="text-center">
                    <strong>Error loading moments:</strong><br />
                    {error}
                </p>
            </section>
        );
    }

    if (carouselImages.length === 0) {
         return (
            <section className="py-12 md:py-16 bg-parchment-dark textile-texture-bg flex justify-center items-center min-h-[300px]">
                <p className="text-charcoal text-xl">No moments to display currently.</p>
            </section>
        );
    }

    // --- Render Carousel when data is ready ---
    return (
        <section className="py-12 md:py-16 bg-parchment-dark textile-texture-bg">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
                    Moments from Our Journeys
                </h2>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop={carouselImages.length > 1} // Only loop if more than 1 image
                    centeredSlides={true}
                    autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    navigation={true}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 3, spaceBetween: 30 },
                    }}
                    a11y={{ prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide', paginationBulletMessage: 'Go to slide {{index}}' }}
                    className="pb-10"
                >
                    {carouselImages.map((image, index) => ( // Added index for potential eager loading
                        <SwiperSlide key={image.id} className="flex justify-center items-center group">
                            <div className="aspect-video w-full overflow-hidden rounded-none shadow-lg relative filter-aged">
                                <img // Use standard img tag
                                    src={image.src}
                                    alt={image.alt}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                                    loading={index === 0 ? "eager" : "lazy"} // Eager load first image
                                    onError={(e) => console.error(`Error loading image ${image.id}: ${image.src}`, e.currentTarget)}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default ImageCarousel;