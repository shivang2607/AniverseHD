import GetWatchListDataById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById";
import Pagination from "@/Components/Pagination";
import WatchListCard from "@/Components/watchListCard";
import { Constant_Var_success } from "@/utils/constants";
import React, { useEffect, useState } from "react";

const WatchListPagination = ({ selectedWatchList }) => {
  const [list, setList] = useState(null);
  const pageSize = 12;
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      setList(null);
      const resp = await GetWatchListDataById({
        watchListId: selectedWatchList.id,
        offset: offset,
        pageSize: pageSize,
        // getAll:true
      });
      if (resp.status === Constant_Var_success) {
        setList(resp.response);
        console.log(resp.response, "hello");
      } else {
        setError(true);
        console.error(resp.response);
      }
    }
    loadUserData();
  }, [selectedWatchList, offset]);

  return (
    <div className="flex flex-col justify-center mx-20 my-10">
      {list ? (
        list.length > 0 ? (
          <div className={`grid md:grid-cols-6 grid-cols-2 gap-4`}>
            {list.map((ele, ind) => (
              <WatchListCard anime={ele} key={ind} />
            ))}
          </div>
        ) : (
          <div className="h-full w-full">No Data</div>
        )
      ) : !error ? (
        <div className="h-full w-full">Loading</div>
      ) : (
        <div className="h-full w-full">Error Loading Data</div>
      )}

      {selectedWatchList && selectedWatchList.animeList.length > 0 && (
        <Pagination
          totalPages={Math.ceil(selectedWatchList.animeList.length / pageSize)}
          pageSize={pageSize}
          setOffset={(val) => setOffset(val)}
        />
      )}
    </div>
  );
};

export default WatchListPagination;
