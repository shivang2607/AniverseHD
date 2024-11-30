//getting the absolute url path 
export const getAbsoluteURLPath = (pathname, searchParams)=>{

    
    const queryString = Array.from(searchParams.entries())
    .filter(par =>  par[0] !== "t")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  // Combine pathname and query string
  const absoluteURLPath = queryString ? `${pathname}?${queryString}` : pathname;

  return absoluteURLPath;
}