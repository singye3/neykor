"use client"; // Keep this if needed for Swiper client-side behavior

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import Loader from '@/components/shared/Loader'; // Import Loader

interface CarouselImage {
    id: string;
    src: string;
    alt: string;
}

// Define props interface
interface ImageCarouselProps {
    heading?: string;
}

const ImageCarousel = ({
    heading = "Moments from Our Journeys" // Default heading
}: ImageCarouselProps) => { // Destructure props
    const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Internal fetch for images remains the same
    useEffect(() => {
        const fetchImages = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure correct API endpoint URL
                const response = await fetch('/api/carousel-images'); // Relative URL should work
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
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
        fetchImages();
    }, []);

    // Loading / Error / No Data States
    if (isLoading) {
        return (
            <section className="py-12 md:py-16 bg-parchment-dark textile-texture-bg flex justify-center items-center min-h-[300px]">
                 <Loader />
            </section>
        );
    }
    if (error) {
        return (
             <section className="py-12 md:py-16 bg-red-100 border border-red-400 text-red-700 px-4 flex justify-center items-center min-h-[300px]">
                <p className="text-center"><strong>Error loading moments:</strong><br /> {error}</p>
            </section>
        );
    }
    if (carouselImages.length === 0 && !isLoading) { // Check loading is done
         return (
            <section className="py-12 md:py-16 bg-parchment-dark textile-texture-bg flex flex-col justify-center items-center min-h-[300px] text-center px-4">
                 {/* Use heading prop */}
                 <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
                    {heading}
                 </h2>
                 <p className="text-charcoal text-xl">No journey moments to display currently.</p>
            </section>
        );
    }

    // --- Render Carousel when data is ready ---
    return (
        <section className="py-12 md:py-16 textile-texture-bg">
            <div className="container mx-auto px-4">
                 {/* Use heading prop */}
                <h2 className="text-3xl md:text-4xl font-bold text-charcoal text-center mb-8 md:mb-12">
                   {heading}
                </h2>
                <Swiper
                    // Swiper config remains the same
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30} slidesPerView={1} loop={carouselImages.length > 1}
                    centeredSlides={true} autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    pagination={{ clickable: true, dynamicBullets: true }} navigation={true}
                    breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 30 } }}
                    a11y={{ prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide', paginationBulletMessage: 'Go to slide {{index}}' }}
                    className="pb-10" // Ensure pagination bullets are visible
                >
                    {carouselImages.map((image, index) => (
                        <SwiperSlide key={image.id} className="flex justify-center items-center group">
                            <div className="aspect-video w-full overflow-hidden shadow-lg relative filter-aged">
                                <img
                                    src={image.src} alt={image.alt}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                                    loading={index < 3 ? "eager" : "lazy"} // Eager load first few
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