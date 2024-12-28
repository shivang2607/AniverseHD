import GlobalLoaderAsComponent from '@/components/GlobalLoaderAsComponent'
import React from 'react'

const Loading = () => {
  return (
    <GlobalLoaderAsComponent isLoaderVisible={true} imageUrl={"/userProfileImage7.jpg"}/>
  )
}

export default Loading;