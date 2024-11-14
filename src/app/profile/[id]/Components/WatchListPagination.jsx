import GetWatchListDataById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById";
import Pagination from "@/components/Pagination";
import WatchListCard from "@/components/watchListCard";
import { Constant_Var_success } from "@/utils/constants";
import React, { useEffect, useState } from "react";

const WatchListPagination = ({ selectedWatchList }) => {
  const [list, setList] = useState(null);
  const [pageSize, setPageSize] = useState(12);
  const [offset, setOffset] = useState(0);

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
        console.error(resp.response);
      }
    }
    loadUserData();
  }, [selectedWatchList, offset, pageSize]);

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
      ) : (
        <div className="h-full w-full">Loading</div>
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
