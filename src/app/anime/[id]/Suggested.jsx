import MainCard from "@/components/mainCard";
import useAnimeStore from "@/ZustandStores/animeStore";
import React, { useState } from "react";
import { useEffect } from "react";
import { Oval } from "react-loader-spinner";

export default function Suggested({ id }) {
  const { getRecommendationsById } = useAnimeStore();
  const [suggestions, setSuggestions] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getRecommendationsById(id);
      setLoading(false);
      // console.log("suggestions",data);
      setSuggestions(data);
    })();
  }, []);
  return (
    <div className="flex flex-col md:px-8 px-4 gap-4 my-16">
      <h1 className="text-primary-400 font-semibold tracking-wide text-2xl">
        You may also like
      </h1>
      <div className="grid md:grid-cols-5 grid-cols-2 gap-4">
        {!loading ? (
          suggestions?.map((anime) => {
            return (
              <MainCard
                anime={{ ...anime.payload, mal_id: anime.id }}
                key={anime.id}
              />
            );
          })
        ) : (
            <div className="w-screen justify-center text-sky-500 mx-auto flex items-center my-4">
          <Oval
            visible={true}
            color="#0ea5e9"
            secondaryColor="#57a6a1"
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass="text-sky-400"
          />
          </div>
        )}
      </div>
    </div>
  );
}
