"use client";

import { Card, Spinner } from "flowbite-react";
import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";

import { Favorite } from "@/types";

const TIME_SHIFT = 6; // hours

export const shiftedDay = (dateTime: moment.Moment) => {
  let out = dateTime.clone();
  out.subtract(TIME_SHIFT, "hours").startOf("day");
  return out;
};

const getImage = (favourite: Favorite): Image => {
  // console.log(favourite);
  const artistImage =
    favourite.artist.images &&
    favourite.artist.images.find((i: Image) => i.width <= 600);
  if (artistImage) {
    return artistImage;
  }
  const albumImage =
    favourite.track?.album?.images &&
    favourite.track.album.images.find((i: Image) => i.width <= 600);
  return albumImage || { url: "disc.png", width: 512, height: 512 };
};

const Itinearry = ({
  itineraryInDays,
  favoriteArtists,
  artistsLoading,
}: any) => {
  return (
    <Card>
      <div className="flex items-center justify-center">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {"Your Glasto Set Menu 🔥"}
        </h5>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {itineraryInDays.map((dailyItinerary: any) => {
            const date = shiftedDay(dailyItinerary[0]?.start);
            return (
              <>
                <li key={`DayHeader-${date}`} className="py-3 sm:py-4">
                  <div className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
                    {date?.format("ddd")}
                  </div>
                </li>
                {dailyItinerary.map((event: any) => {
                  const favourite = favoriteArtists[event.name];
                  return (
                    <li
                      key={`${event.location}-${event.start}-${event.name}`}
                      className="py-3 sm:py-4"
                    >
                      <div className="flex space-x-2 ">
                        <div className="shrink-0">
                          <img
                            alt={favourite.artist.name}
                            src={getImage(favourite).url}
                            width="100"
                          />
                        </div>
                        <div className="flex flex-col space-y-2 items-left w-full justify-between">
                          {/* <div className='flex' > */}
                          <div className="flex flex-col">
                            <div>
                              <p className="text-sm font-medium text-left   text-gray-900 dark:text-white">
                                {favourite.setName}
                              </p>
                            </div>
                            <div className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
                              {/* {eventsByArtist[favourite.setName]?.events.map( */}
                              {/* (e: any) => ( */}
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {event.location}
                                {" @ "}
                                {event.start.format("ddd")}{" "}
                                {event.start.format("ha")}
                              </p>
                              {/* ) */}
                              {/* )} */}
                            </div>
                          </div>
                          <div className="flex w-full justify-end">
                            <a href={favourite.artist.external_urls.spotify}>
                              <img
                                alt={favourite.artist.name}
                                // className="rounded-full"
                                // height="32"
                                src="spotifylogosmallblack.png"
                                width="25"
                              />
                            </a>
                          </div>
                          {/* </div> */}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </>
            );
          })}
          {/* {!!user && !topArtists.length && !artistsLoading &&  <div id={"connectAccount"} className={'flex flex-col align-center py-10'}>
  

  <Button color="dark" onClick={fetchAll}>                    
  <h2 className={`text-m font-semibold text-center`}>
          Load your Set Menu
      </h2>              
      </Button>
</div>
} */}
          {artistsLoading && (
            <div className="flex justify-center py-10">
              <Spinner aria-label="Extra large spinner example" size="xl" />
            </div>
          )}
          {!itineraryInDays.length && (
            <li className="py-3 sm:py-4">
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {"None of your top artists are playing at Glastonbury 😭"}
                  </p>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
};

export default Itinearry;
