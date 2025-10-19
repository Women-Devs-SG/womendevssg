import React, { useState, useEffect } from 'react';

interface LikeButtonProps {
  postSlug: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postSlug }) => {
  const [likes, setLikes] = useState(0);
  const [userLikes, setUserLikes] = useState(0);
  const MAX_LIKES = 10;

  // Load likes from localStorage when component mounts
  useEffect(() => {
    const storedUserLikes = localStorage.getItem(`likes_${postSlug}`);
    const storedTotalLikes = localStorage.getItem(`total_likes_${postSlug}`);
    
    if (storedUserLikes) {
      setUserLikes(parseInt(storedUserLikes));
    }
    if (storedTotalLikes) {
      setLikes(parseInt(storedTotalLikes));
    }
  }, [postSlug]);

  const handleLike = () => {
    if (userLikes < MAX_LIKES) {
      const newUserLikes = userLikes + 1;
      const newTotalLikes = likes + 1;
      
      setUserLikes(newUserLikes);
      setLikes(newTotalLikes);
      
      localStorage.setItem(`likes_${postSlug}`, newUserLikes.toString());
      localStorage.setItem(`total_likes_${postSlug}`, newTotalLikes.toString());
    }
  };

  const handleUnlike = () => {
    if (userLikes > 0) {
      const newUserLikes = userLikes - 1;
      const newTotalLikes = likes - 1;
      
      setUserLikes(newUserLikes);
      setLikes(newTotalLikes);
      
      localStorage.setItem(`likes_${postSlug}`, newUserLikes.toString());
      localStorage.setItem(`total_likes_${postSlug}`, newTotalLikes.toString());
    }
  };

  return (
    <div className="my-8 flex items-center gap-4">
      <button
        onClick={handleLike}
        disabled={userLikes >= MAX_LIKES}
        className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
          userLikes >= MAX_LIKES
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-red-50 hover:bg-red-100 text-red-600'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={userLikes > 0 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="font-semibold">{likes}</span>
      </button>

      {userLikes > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            You've liked this <span className="font-semibold text-red-600">{userLikes}/{MAX_LIKES}</span>
          </span>
          <button
            onClick={handleUnlike}
            className="text-xs text-gray-500 hover:text-red-600 underline"
          >
            Remove one
          </button>
        </div>
      )}

      {userLikes === MAX_LIKES && (
        <span className="text-sm text-green-600 font-medium">
          ⭐ Maxed out!
        </span>
      )}
    </div>
  );
};

export default LikeButton;
