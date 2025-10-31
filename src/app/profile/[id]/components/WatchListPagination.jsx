import GetWatchListDataById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById";
import CustomLoader from "@/components/CustomLoader";
import Pagination from "@/components/Pagination";
import WatchListCard from "@/components/watchListCard";
import { Constant_Var_success } from "@/utils/constants";
import React, { useEffect, useRef, useState } from "react";

const WatchListPagination = ({ selectedWatchList }) => {
  const [list, setList] = useState(null);
  const pageSize = 12;
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  let prevWatchListId = useRef(null);

  useEffect(() => {
    async function loadWatchListData() {
      let newOffset = 0;
      if (
        prevWatchListId?.current &&
        prevWatchListId.current === selectedWatchList.id
      ) {
        if (offset == 0 || offset < selectedWatchList.animeList.length) {
          newOffset = offset;
        } else newOffset = offset - pageSize;
      } else prevWatchListId.current = selectedWatchList.id;

      if (offset != newOffset) {
        setOffset(newOffset);
        return;
      }
      setList(null);
      // console.log("watchlist changed",offset,selectedWatchList);
      const resp = await GetWatchListDataById({
        watchListId: selectedWatchList.id,
        offset: newOffset,
        pageSize: pageSize,
        // getAll:true
      });
      if (resp.status === Constant_Var_success) {
        setTimeout(() => {
          setList(resp.response);
          setError(false);
        }, 500);
      } else {
        setError(true);
        // console.error(resp.response);
      }
    }

    loadWatchListData();
  }, [offset, selectedWatchList]);

  useEffect(() => {
    setOffset((currentPage - 1) * pageSize);
  }, [currentPage]);

  const reloadWatchListData = async () => {};

  return (
    <div className="flex flex-col justify-center  sm:mx-10 mx-4  my-10">
      {list ? (
        list.length > 0 ? (
          <div
            className={`grid lg:grid-cols-6 sm:grid-cols-4 grid-cols-2 gap-4 transition-all duration-500`}
          >
            {list.map((ele, ind) => (
              <WatchListCard
                anime={ele}
                key={ele.animeId}
                watchListId={selectedWatchList.id}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-[60vh]"> <CustomLoader imageUrl={"/NoData.gif"} loaderText={"Empty List"}/></div>
        )
      ) : !error ? (
        <div className="h-[70vh] -my-10 -mx-4">
          <CustomLoader imageUrl={"/userProfileImage5.jpg"} loaderText={"Loading WatchList..."}/>
        </div>
      ) : (
        <div className="w-full h-[60vh]"> <CustomLoader imageUrl={"/NoData.gif"} loaderText={"Error Loading WatchList"}/></div>
      )}

      {selectedWatchList && selectedWatchList.animeList.length > 0 && (
        <Pagination
          totalPages={Math.ceil(selectedWatchList.animeList.length / pageSize)}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          key={selectedWatchList.id}
        />
      )}
    </div>
  );
};

export default WatchListPagination;
