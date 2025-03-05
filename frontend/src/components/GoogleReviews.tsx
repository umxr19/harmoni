import React, { useEffect, useState } from 'react';
import '../styles/GoogleReviews.css';

interface GoogleReviewsProps {
  placeId: string;
  apiKey?: string;
  showRating?: boolean;
  reviewCount?: number;
}

export const GoogleReviews: React.FC<GoogleReviewsProps> = ({ 
  placeId, 
  apiKey, 
  showRating = true,
  reviewCount = 5
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no API key is provided, use mock data
    if (!apiKey) {
      // Mock data for demonstration
      setPlaceDetails({
        name: "11+ Tutoring Service",
        rating: 4.8,
        user_ratings_total: 47
      });
      
      setReviews([
        {
          author_name: "Jane Smith",
          profile_photo_url: "https://via.placeholder.com/40",
          rating: 5,
          relative_time_description: "a month ago",
          text: "Excellent tutoring service! My child's confidence has improved dramatically and they achieved great results in their 11+ exam."
        },
        {
          author_name: "John Davis",
          profile_photo_url: "https://via.placeholder.com/40",
          rating: 5,
          relative_time_description: "2 months ago",
          text: "The practice questions and mock exams were incredibly helpful. The tutors are knowledgeable and patient."
        },
        {
          author_name: "Sarah Johnson",
          profile_photo_url: "https://via.placeholder.com/40",
          rating: 4,
          relative_time_description: "3 months ago",
          text: "Great resources and support. My son enjoyed the interactive learning approach."
        }
      ]);
      
      setLoading(false);
      return;
    }
    
    // Load the Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => setError("Failed to load Google Maps API");
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [apiKey, placeId]);
  
  const initMap = () => {
    // @ts-ignore
    const map = new google.maps.Map(document.createElement('div'));
    // @ts-ignore
    const service = new google.maps.places.PlacesService(map);
    
    service.getDetails({
      placeId: placeId,
      fields: ['name', 'rating', 'user_ratings_total', 'reviews']
    // @ts-ignore
    }, (place: any, status: any) => {
      // @ts-ignore
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        setPlaceDetails(place);
        if (place.reviews) {
          setReviews(place.reviews.slice(0, reviewCount));
        }
        setLoading(false);
      } else {
        setError("Failed to fetch reviews");
        setLoading(false);
      }
    });
  };
  
  if (loading) return <div className="google-reviews-loading">Loading reviews...</div>;
  if (error) return <div className="google-reviews-error">{error}</div>;
  
  return (
    <div className="google-reviews-container">
      {showRating && placeDetails && (
        <div className="google-reviews-header">
          <div className="place-info">
            <h3>{placeDetails.name}</h3>
            <div className="rating-container">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`star ${star <= Math.round(placeDetails.rating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {placeDetails.rating} stars from {placeDetails.user_ratings_total} reviews
              </span>
            </div>
          </div>
          <div className="google-badge">
            <a 
              href={`https://search.google.com/local/reviews?placeid=${placeId}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
                alt="Google" 
                width="92" 
                height="30" 
              />
              <span>Reviews</span>
            </a>
          </div>
        </div>
      )}
      
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <img 
                    src={review.profile_photo_url || "https://via.placeholder.com/40"} 
                    alt={review.author_name} 
                    className="reviewer-photo" 
                  />
                  <div className="reviewer-details">
                    <div className="reviewer-name">{review.author_name}</div>
                    <div className="review-date">{review.relative_time_description}</div>
                  </div>
                </div>
                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`star ${star <= review.rating ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="review-text">{review.text}</div>
            </div>
          ))
        ) : (
          <div className="no-reviews">No reviews available</div>
        )}
      </div>
      
      <div className="reviews-footer">
        <a 
          href={`https://search.google.com/local/writereview?placeid=${placeId}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="write-review-button"
        >
          Write a Review
        </a>
        <a 
          href={`https://search.google.com/local/reviews?placeid=${placeId}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="view-all-button"
        >
          View All Reviews
        </a>
      </div>
    </div>
  );
}; 