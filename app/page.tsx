'use client';

import {useEffect, useState} from 'react'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { Page, Artist, Track} from '@spotify/web-api-ts-sdk/dist/mjs/types';

import g2023SpotifyIDsJson from '../public/g2023SpotifyIDs.json';
import g2023 from '../public/g2023.json';
import moment from 'moment';

import { Button, Card, Footer, Spinner } from 'flowbite-react';
import { useReadLocalStorage } from 'usehooks-ts'

const SpotifyClientID = "7116f40f98d64f5cbb9e2aafb2209702"
const RedirectURL = "https://sets-menu.pages.dev/"
const sdk = SpotifyApi.withUserAuthorization(SpotifyClientID, RedirectURL, ["user-top-read"]);

const removeDupes = (totalArray: any[]) => {
  let uniqueArray: any[]  = []
  totalArray.forEach(x => {
    if(!uniqueArray.some(y => y.setName === x.setName)){
      uniqueArray.push(x)
    }
  })
  return uniqueArray
}

export default function Home() {

  const spotifyKeyExists: any = useReadLocalStorage('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token')

  const [artistsLoading, setArtistsLoading] = useState<boolean>(false)
  const [tracksLoading, setTracksLoading] = useState<boolean>(false)
  const [intialLoadDone, setInitialLoadDone] = useState<boolean>(false)

  
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [topTracks, setTopTracks] = useState<Track[]>([])


  // const isAuth = () => {
  //   sdk?.currentUser.topItems("artists")
  // }

  const performSpotifyAuth = () => {
    console.log("test")
    console.log(RedirectURL)
    // setSDK(sdk)
    sdk.authenticate()
  }

  const fetchAll = () => {
    const fetchArtists = async () => {
      console.log("Fetching artists")
      // const artistsPage = await sdk.currentUser.topItems("artists")
      const offset  = 0
      const timeRange = "medium_term"
      const shortTerm1 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=0&time_range=short_term`)
      const shortTerm2 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=49&time_range=short_term`)
      const mediumTerm1 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=0&time_range=medium_term`)
      const mediumTerm2 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=49&time_range=medium_term`)
      const longTerm1 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=0&time_range=long_term`)
      const longTerm2 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=49&time_range=long_term`)

      const artistsPage = await Promise.all([shortTerm1, shortTerm2, mediumTerm1, mediumTerm2, longTerm1, longTerm2])
      setTopArtists(artistsPage.reduce((artists,a)=> artists.concat(a.items) ,[] as Array<any> ))
      setArtistsLoading(false)
    }
    const fetchTracks = async () => {
      console.log("Fetching tracks")
      // const artistsPage = await sdk.currentUser.topItems("artists")
      const offset  = 0
      const timeRange = "medium_term"
      const shortTerm1 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=0&time_range=short_term`)
      const shortTerm2 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=49&time_range=short_term`)
      const mediumTerm1 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=0&time_range=medium_term`)
      const mediumTerm2 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=49&time_range=medium_term`)
      const longTerm1 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=0&time_range=long_term`)
      const longTerm2 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=49&time_range=long_term`)

      const artistsPage = await Promise.all([shortTerm1, shortTerm2, mediumTerm1, mediumTerm2, longTerm1, longTerm2])
      setTopTracks(artistsPage.reduce((tracks,a)=> tracks.concat(a.items) ,[] as Array<any>))
      setTracksLoading(false)
    }
    setArtistsLoading(true)
    setTopArtists([])
    fetchArtists().catch(console.error)

    setTracksLoading(true)
    setTopTracks([])
    fetchTracks().catch(console.error)

  }
  const g2023SpotifyIDs: any = g2023SpotifyIDsJson
  const glastoIDs: any = Object.keys(g2023SpotifyIDs)
  const matchedArtists = removeDupes(topArtists.filter(a => glastoIDs.includes(a.id)).map(a=> ({artist: a, setName: g2023SpotifyIDs[a.id]})))
  const matchedArtistsWithTracks = topTracks.reduce((artists, t) => ({...artists, ...t.artists.filter(a => glastoIDs.includes(a.id)).reduce((trackArtists, a) => ({...trackArtists, [a.id]: {track: t, artist: a, setName: g2023SpotifyIDs[a.id]}}),{})  }), {})
  
  const processCFjson = (json: any) => {
    const events = json.locations.reduce((events: any, location: any) => events.concat(location.events.map((e: any) => ({...e, location: location.name}))), [] )
    return events.reduce((artistEvents: any, e: any) => ({...artistEvents, [e.name]: {events: [e].concat(artistEvents[e.name]?.events ?? [])}}),{}) 
    }

  matchedArtists.sort((a,b)=> b.artist.popularity - a.artist.popularity)
    
  
  useEffect(() => {
    setInitialLoadDone(true)
  }, [])
  
  const eventsByArtist = processCFjson(g2023)
  console.log("test")
  console.log(artistsLoading)
  console.log(tracksLoading)
  console.log(topArtists)
  console.log(!spotifyKeyExists)

  
  return intialLoadDone ? (
    <main className="flex min-h-screen w-full flex-col items-center justify-start">
      <div className={"px-5 py-10 flex-grow"} >
        <div id={"header"} className="relative flex place-items-center flex-col mb-5">
            <h1 className={`mb-3 text-3xl font-semibold text-center`}>
               Sets Menu
             </h1>
             <div>
             <p className={`text-xs text-center opacity-50`}>
               {"You can't remember every artists name"}
             </p>
             </div>

        </div>

        <div className="flex flex-col items-center flex-grow justify-start">


        { !spotifyKeyExists && <Card href="#">
          < div>
              <h5 className="text-m font-bold tracking-tight text-gray-900 dark:text-white">
                <p>
                  {"Use your Spotify history to find your Glasto 23 'Sets Menu'"}
                </p>
              </h5>
            </div>
          </Card> }

                  {/* <div id={"chooseFestival"} className={'justify-self-center pt-10'}>
                    <h2 className={`text-m font-semibold opacity-50 text-left`}>
                              Choose your festival
                          </h2>
                    <div
                      className="mb-2 flex flex-col group rounded-lg border border-transparent px-5 py-4 text-center bg-neutral-800 bg-opacity-50 hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
                              >
                        <div className={`text-m font-semibold opacity-80`}>
                        </div>
                            <img src='/glasto.png' width="200" height="50"/>
                            <div className={`text-sm font-semibold `}>
                              Glastonbury 2023
                          </div>
                    </div>
                    <h2 className={`m-0 text-xs text-center opacity-50`}>
                        More festivals coming soon...           
                    </h2>
                  </div> */}
                  
          
         { !spotifyKeyExists && <div id={"connectAccount"} className={'justify-self-center pt-10'}>
         <h2 className={`text-m font-semibold opacity-50 text-center pb-3`}>
                      Connect your account using
                  </h2>

              <Button color="dark" onClick={performSpotifyAuth}>                    
                <img alt="spotify logo" src='/spotifylogo.png' width="200" height="50"/>
              </Button>
            <h2 className={`text-xs text-center opacity-50 pt-1`}>
                No data leaves your device            
            </h2>
           
        </div> 
          }
   

  { spotifyKeyExists &&  <Card>
  <div className="flex items-center justify-between">
    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
      Your top artists 🔥
    </h5>
    {/* <a
      className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500"
      href="#"
    >
      <p>
        View all
      </p>
    </a> */}
  </div>
  <div className="flow-root">
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {matchedArtists.map((a => 
      <li key={a.artist.id} className="py-3 sm:py-4">
        <div className="flex flex-col items-center space-x-4 sm:flex-row">
          <div className="shrink-0">
            <img
              alt={a.artist.name}
              // className="rounded-full"
              // height="32"
              src={a.artist.images[0].url}
              width="100"
            />
          </div>
          {/* <div className='flex' > */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-center sm:text-left text-gray-900 dark:text-white">
                {a.setName}
              </p>
            </div>
            <div className="items-center text-center sm:text-right text-base font-semibold text-gray-900 dark:text-white">
              {eventsByArtist[a.setName]?.events.map((e: any) =>(<p key={`${e.start}-${e.end}-${e.location}`} className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {e.location}{" @ "}{moment(e.start).format('ddd')}{" "}{moment(e.start).format('ha')}
                  </p>))}
            </div>
          {/* </div> */}
        </div>
      </li>
      ))}
      {!!spotifyKeyExists && !topArtists.length && !artistsLoading &&  <div id={"connectAccount"} className={'flex flex-col align-center py-10'}>
            

            <Button color="dark" onClick={fetchAll}>                    
            <h2 className={`text-m font-semibold text-center`}>
                    Load your Set Menu
                </h2>              
                </Button>
        </div>
        }
      {!matchedArtists.length && !!topArtists.length && <li className="py-3 sm:py-4">
        <div className="flex items-center space-x-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {"None of your top artists are playing at Glastonbury 😭"}
            </p>
          </div>
        </div>
      </li>}
    </ul>
  </div>
</Card>
}




          </div>
      </div>
      <Footer bgDark>
        <div className="w-full">
          <div className="w-full bg-gray-700 px-4 py-6 sm:flex sm:items-center sm:justify-between">
            <Footer.Copyright
              by="Jack Farrant"
              href="#"
              year={2023}
            />

          </div>
        </div>
      </Footer>
    </main>
) :  <main className="flex min-h-screen w-full flex-col items-center justify-center">
        <Spinner
          aria-label="Extra large spinner example"
          size="xl"
        />
  </main>
}
