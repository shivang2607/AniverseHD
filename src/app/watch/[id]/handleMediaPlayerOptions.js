import UpdatePlayerOptions from '@/app/firebase/Profile/UpdatePlayerOptions';
import { useRef } from 'react';
import toast from 'react-hot-toast';

const HandleUpdateMediaPlayerOptions = () => {
  const debounceRef = useRef(null);

  return async (opt) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(async () => {
      try {

        //* opt and updateOPtions have differnet kjey names, because Me and abhay has used different key names on our sides.
        const updatedOptions = {
            autoPlay: opt?.isAutoPlay,
            autoNext: opt?.isAutoNext,
            autoSkipIntro: opt?.isAutoSkip,
        }
        const result = await UpdatePlayerOptions(updatedOptions);

        if (result.status === 'success') {
          console.log('Play options updated successfully.');
          toast.success("Changes saved Successfully!");
        } else {
            console.log(opt, result);
          toast.error('Failed to save changes!');
        }
      } catch (error) {
        console.error('Error updating player options:', error);
        toast.error('An error occurred while saving changes!');
      }
    }, 300); // Debounce delay 
  };
};

export default HandleUpdateMediaPlayerOptions;
