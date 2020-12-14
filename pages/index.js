import Head from 'next/head'
import { useCallback, useEffect, useRef, useState } from 'react'
import day from 'dayjs'

export default function Home () {
  const player = useRef()
  const playerSilent = useRef()
  const startTime = day('2020-12-14 19:00:00')
  const endTime = startTime.add(37, 'minutes').add(48, 'seconds')
  const nextTiming = () => 1000 - day() % 1000

  const [state, setState] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isCountEnabled, setCountEnabled] = useState(true)
  const [allowPlaySound, setAllowPlay] = useState(false)
  const [isEnded, setIsEnded] = useState(false)

  const playSong = useCallback((currentTime = 0) => {
    if (isEnded || !allowPlaySound) return
    player.current.currentTime = currentTime
    player.current.play()
      .then(() => {
        console.log('play')
        console.log(player.current.muted)
      }).catch((e) => {
        console.error(e.name)
      })
  }, [isEnded, allowPlaySound])

  const setNewTime = useCallback(() => {
    const diff = day(startTime).diff(day())

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (diff < 0) {
      setState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setCountEnabled(false)
      playSong()
    } else {
      setState({ days, hours, minutes, seconds })
      setCountEnabled(true)
    }
  }, [playSong, startTime])

  useEffect(() => {
    if (player.current) {
      player.current.src = '/sound/is_countdown.mp3'
      player.current.load()
    }
  }, [player])

  useEffect(() => {
    if (playerSilent.current) {
      playerSilent.current.src = '/sound/no_sound.mp3'
      playerSilent.current.load()
    }
  }, [playerSilent])

  useEffect(() => {
    if (isCountEnabled && !isEnded) {
      let timer = setTimeout(() => {
        timer = setTimeout(() => nextTiming())
        setNewTime()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state, isCountEnabled, isEnded, setNewTime])

  useEffect(() => {
    if (day().isAfter(endTime)) {
      setIsEnded(true)
      setCountEnabled(false)
    } else {
      setIsEnded(false)
    }
  }, [endTime])

  useEffect(() => {
    if (!isCountEnabled && !isEnded) {
      const ms = day().diff(startTime)
      const delay = 1000 - ms % 1000

      setTimeout(() => {
        playSong(day().diff(startTime, 's'))
      }, delay)
    }
  }, [allowPlaySound, isCountEnabled, isEnded, playSong, startTime])

  const playSilent = () => {
    playerSilent.current.play()
      .then(() => {
        console.log('play silent')
      }).catch((e) => {
        console.error(e.name)
      })
  }

  const Description = () => {
    return (
      <>
        {isEnded && (
          <p className='mt-6 text-gray-600'>ショーは終了しました。2021年もImagination Serverをよろしくお願いいたします✨</p>
        )}
        {!isEnded && allowPlaySound && (
          <p className='mt-6 text-gray-600'>音声が流れます。ショーをご覧の際はこのページを閉じないでください。</p>
        )}
        {!isEnded && !allowPlaySound && (
          <>
            <p className='mt-6 text-gray-600'>ショーの公演中に音楽を再生するには許可が必要です。</p>
            <button onClick={() => { playSilent(); setAllowPlay(true) }} className='mt-8 inline-flex items-center text-center px-4 py-2 border border-transparent rounded-md shadow-sm text font-medium text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600'>音楽の再生を許可する</button>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <Head>
        <title>イマジネーション・カウントダウン 2020</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='relative w-full h-full px-4 bg-pattern bg-gray-50'>
        <div className='relative container mx-auto flex items-center justify-center h-full'>
          <div className='text-center'>
            <h1 className='font-bold text-2xl md:text-3xl'><span>イマジネーション・カウントダウン </span><span>2020</span></h1>
            <Description />
          </div>
        </div>
        <div className='fixed left-0 right-0 bottom-0 text-center w-full mb-8'>
          {!isCountEnabled && !isEnded && (
            <div className='text-xs text-gray-600 mb-4'>ショーは公演中です。リアルタイムで再生いたします。</div>
          )}
          {isCountEnabled && (
            <>
              <div className='text-xs text-gray-600 mb-4'>再生まで</div>
              <div className='flex w-full justify-center'>
                <div className='flex flex-col mx-4'>
                  <span className='text-xl font-bold font-mono'>{state.days}</span>
                  <span className='text-xs'>日</span>
                </div>
                <div>:</div>
                <div className='flex flex-col mx-4'>
                  <span className='text-xl font-bold font-mono'>{state.hours}</span>
                  <span className='text-xs'>時間</span>
                </div>
                <div>:</div>
                <div className='flex flex-col mx-4'>
                  <span className='text-xl font-bold font-mono'>{state.minutes}</span>
                  <span className='text-xs'>分</span>
                </div>
                <div>:</div>
                <div className='flex flex-col mx-4'>
                  <span className='text-xl font-bold font-mono'>{state.seconds}</span>
                  <span className='text-xs'>秒</span>
                </div>
              </div>
            </>
          )}
          {!isCountEnabled && isEnded && (
            <div className='text-xs text-gray-600 mb-4'>HAPPY NEW YEAR!</div>
          )}
        </div>
      </main>
      <audio className='audio-element' ref={playerSilent} />
      <audio className='audio-element' ref={player} onEnded={() => setIsEnded(true)} />
    </>
  )
}
