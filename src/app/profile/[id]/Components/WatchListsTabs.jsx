import React, { useEffect, useState } from "react";

const WatchListsTabs = ({
  StarterWatchLists,
  CustomWatchLists,
  setSelectedWatchList,
  selectedWatchList,
}) => {
  const [selectedCustomOption, setSelectedCustomOption] = useState(null);

  const handleSelectChange = (event) => {
    const selectedId = event.target.value;
    const selectedObject = CustomWatchLists.find(
      (ele) => ele.id === selectedId
    );
    setSelectedCustomOption(selectedObject);
    setSelectedWatchList(selectedObject);
  };

  return (
    <div className="flex flex-row">
      {StarterWatchLists.map((ele, ind) => {
        return (
          <div
            key={ind}
            className={`mx-5 ${
              selectedWatchList.id == ele.id && "bg-gray-600"
            } p-2 rounded-md cursor-pointer`}
            onClick={() => {
              setSelectedWatchList(ele), setSelectedCustomOption(null);
            }}
          >
            {ele.watchListName}
          </div>
        );
      })}
      {StarterWatchLists.length == 0 ? (
        CustomWatchLists.map((ele, ind) => {
          return (
            <div
              key={ind}
              className={`mx-5 ${
                selectedWatchList.id == ele.id && "bg-gray-600"
              } p-2 rounded-md cursor-pointer`}
              onClick={() => {
                setSelectedWatchList(ele);
              }}
            >
              {ele.watchListName}
            </div>
          );
        })
      ) : (
        <select
          value={selectedCustomOption ? selectedCustomOption.id : ""}
          onChange={handleSelectChange}
        >
          <option className="hidden" value="" disabled>
            Custom WatchLists
          </option>
          {CustomWatchLists &&
            CustomWatchLists.map((ele) => (
              <option value={ele.id} key={ele.id} className="w-20 h-20">
                {ele.watchListName}
              </option>
            ))}
        </select>
      )}
    </div>
  );
};

export default WatchListsTabs;
