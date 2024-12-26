'use client'

import { useState, useEffect } from 'react'
import { Card } from '../src/components/ui/card'
import { Button } from '../src/components/ui/button'
import { Input } from '../src/components/ui/input'
import { Plus, LogIn, Users, Globe, RotateCcw, ArrowLeft, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../src/components/ui/avatar-dialog"
import Starfield from './components/starfield'
import { Avatar, AvatarFallback, AvatarImage } from "../src/components/ui/avatar-dialog"
import { motion, AnimatePresence } from "framer-motion"

const avatars = [
  '/placeholder.svg?height=40&width=40&text=👧',
  '/placeholder.svg?height=40&width=40&text=👦',
  '/placeholder.svg?height=40&width=40&text=👩',
  '/placeholder.svg?height=40&width=40&text=👨',
]

const GameBoard = ({ board, handleClick, gameState }) => {
  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto mb-4">
      {/* Horizontal Lines */}
      <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white"></div>
      <div className="absolute top-2/3 left-0 w-full h-[1px] bg-white"></div>
      
      {/* Vertical Lines */}
      <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white"></div>
      <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white"></div>
      
      {/* Grid Cells */}
      <div className="grid grid-cols-3 h-full">
        {board.map((square, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`
              flex items-center justify-center text-4xl font-bold
              ${gameState !== 'playing' ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}
              ${square ? 'text-white' : ''}
            `}
            disabled={gameState !== 'playing'}
          >
            {square}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [gameState, setGameState] = useState('initial')
  const [gameId, setGameId] = useState('')
  const [inputGameId, setInputGameId] = useState('')
  const [gameResult, setGameResult] = useState(null)
  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  })
  const [players, setPlayers] = useState([])
  const [countdown, setCountdown] = useState(6)
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false)
  const [searchingAvatars, setSearchingAvatars] = useState(avatars)
  const [matchFound, setMatchFound] = useState(false)

  useEffect(() => {
    if (gameState === 'searching') {
      const avatarInterval = setInterval(() => {
        setSearchingAvatars(prevAvatars => {
          const newAvatars = [...prevAvatars]
          newAvatars.push(newAvatars.shift())
          return newAvatars
        })
      }, 500)

      const matchTimer = setTimeout(() => {
        setMatchFound(true)
        setTimeout(() => {
          setGameState('playing')
          const playerX = { id: `User${Math.floor(1000 + Math.random() * 9000)}`, symbol: 'X', avatar: searchingAvatars[0] }
          const playerO = { id: `User${Math.floor(1000 + Math.random() * 9000)}`, symbol: 'O', avatar: searchingAvatars[1] }
          setPlayers([playerX, playerO])
        }, 1500)
      }, 3000)

      return () => {
        clearInterval(avatarInterval)
        clearTimeout(matchTimer)
      }
    }
  }, [gameState, searchingAvatars])

  useEffect(() => {
    let timer
    if (gameState === 'ended' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      resetGame(false)
    }
    return () => clearInterval(timer)
  }, [gameState, countdown])

  const createGame = () => {
    const newGameId = Math.floor(1000 + Math.random() * 9000).toString()
    setGameId(newGameId)
    setGameState('mode_selection')
  }

  const joinGame = () => {
    if (inputGameId.length === 4) {
      setGameId(inputGameId)
      setGameState('playing')
      startGame()
    }
  }

  const startGame = () => {
    const playerX = { id: `User${Math.floor(1000 + Math.random() * 9000)}`, symbol: 'X', avatar: avatars[Math.floor(Math.random() * avatars.length)] }
    const playerO = { id: `User${Math.floor(1000 + Math.random() * 9000)}`, symbol: 'O', avatar: avatars[Math.floor(Math.random() * avatars.length)] }
    setPlayers([playerX, playerO])
  }

  const handleClick = (index) => {
    if (board[index] || gameState !== 'playing') return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const winner = calculateWinner(newBoard)
    if (winner) {
      endGame(winner === currentPlayer ? 'win' : 'loss')
    } else if (newBoard.every(square => square !== null)) {
      endGame('draw')
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const endGame = (result) => {
    setGameResult(result)
    setGameState('ended')
    setStats(prevStats => ({
      totalMatches: prevStats.totalMatches + 1,
      wins: prevStats.wins + (result === 'win' ? 1 : 0),
      losses: prevStats.losses + (result === 'loss' ? 1 : 0),
      draws: prevStats.draws + (result === 'draw' ? 1 : 0),
    }))
    setCountdown(6)
  }

  const resetGame = (keepId = false) => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setGameState('initial')
    setGameResult(null)
    setCountdown(6)
    setMatchFound(false)
    if (!keepId) {
      setGameId('')
      setInputGameId('')
      setPlayers([])
    }
  }

  const playAgain = () => {
    resetGame(true)
    setGameState('playing')
  }

  const restartGame = () => {
    resetGame(false)
    setShowRestartConfirmation(false)
  }

  const getWinnerMessage = () => {
    if (gameResult === 'draw') return "It's a draw!"
    const winner = players.find(p => p.symbol === currentPlayer)
    return `${winner?.id} (${winner?.symbol}) won!`
  }

  const goBack = () => {
    if (gameState === 'mode_selection' || gameState === 'enter_friend_id') {
      setGameState('initial')
    } else if (gameState === 'searching') {
      setGameState('mode_selection')
    } else if (gameState === 'playing') {
      setShowRestartConfirmation(true)
    }
  }

  return (
    <>
      <Starfield />
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 z-10">
        <Card className="p-6 backdrop-blur-md bg-black/90 rounded-[32px] w-full max-w-md text-white border-white/10">
          {gameState !== 'initial' && gameState !== 'ended' && (
            <Button 
              onClick={goBack} 
              className="absolute bottom-2 left-2 bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {gameState === 'initial' && (
            <div className="space-y-4">
              <Button onClick={createGame} className="w-full bg-blue-500 hover:bg-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Game
              </Button>
              <div className="flex space-x-2">
                <Input
                  value={inputGameId}
                  onChange={(e) => setInputGameId(e.target.value)}
                  placeholder="Enter 4-digit Game ID"
                  maxLength={4}
                  className="bg-white/20 border-gray-600 text-white placeholder-gray-400"
                />
                <Button onClick={joinGame} disabled={inputGameId.length !== 4} className="bg-green-500 hover:bg-green-600">
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Game
                </Button>
              </div>
            </div>
          )}

          {gameState === 'mode_selection' && (
            <div className="space-y-4">
              <div className="text-2xl font-semibold mb-4 text-center">
                Game ID: {gameId}
              </div>
              <Button 
                onClick={() => setGameState('searching')} 
                className="w-full h-24 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Globe className="mr-2 h-6 w-6" />
                Play Online
              </Button>
              <Button 
                onClick={() => setGameState('enter_friend_id')} 
                className="w-full h-24 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                <Users className="mr-2 h-6 w-6" />
                Play with Friends
              </Button>
            </div>
          )}

          {gameState === 'enter_friend_id' && (
            <div className="space-y-4">
              <Input
                value={inputGameId}
                onChange={(e) => setInputGameId(e.target.value)}
                placeholder="Enter friend's 4-digit Game ID"
                maxLength={4}
                className="bg-white/20 border-gray-600 text-white placeholder-gray-400"
              />
              <Button onClick={joinGame} disabled={inputGameId.length !== 4} className="w-full bg-green-500 hover:bg-green-600">
                <LogIn className="mr-2 h-4 w-4" />
                Join Friend's Game
              </Button>
            </div>
          )}

          {gameState === 'searching' && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-semibold mb-4">Searching for players...</div>
              <div className="flex justify-center space-x-4">
                <AnimatePresence>
                  {searchingAvatars.slice(0, 2).map((avatar, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Avatar className={`w-16 h-16 ${matchFound ? 'animate-bounce' : 'animate-pulse'}`}>
                        <AvatarImage src={avatar} alt={`Player ${index + 1}`} />
                        <AvatarFallback>P{index + 1}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {matchFound && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold text-green-500"
                >
                  Match Found!
                </motion.div>
              )}
              <Button onClick={() => setGameState('mode_selection')} className="bg-red-500 hover:bg-red-600">
                Stop Matching
              </Button>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'ended') && (
            <>
              <div className="text-2xl font-semibold mb-4 text-center">
                Game ID: {gameId}
              </div>
              <div className="text-xl font-semibold mb-4 text-center">
                {gameState === 'playing' ? `Current Player: ${currentPlayer}` : 'Game Over'}
              </div>
              
              <GameBoard 
                board={board}
                handleClick={handleClick}
                gameState={gameState}
              />

              <div className="flex justify-between items-center mb-4">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={player.avatar} alt={player.id} />
                      <AvatarFallback>{player.symbol}</AvatarFallback>
                    </Avatar>
                    <span>{player.id} ({player.symbol})</span>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div className="text-center mt-4">
            <div>Total Matches: {stats.totalMatches}</div>
            <div>Wins: {stats.wins} | Losses: {stats.losses} | Draws: {stats.draws}</div>
          </div>
        </Card>

        <Dialog open={gameState === 'ended'} onOpenChange={() => {}}>
          <DialogContent className="bg-black/90 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Game Over</DialogTitle>
              <DialogDescription className="text-xl text-center mt-4">
                {getWinnerMessage()}
              </DialogDescription>
            </DialogHeader>
            <div className="text-center mt-4">
              Game will reset in {countdown} seconds...
            </div>
            <DialogFooter className="sm:justify-center space-x-2">
              <Button onClick={playAgain} className="bg-blue-500 hover:bg-blue-600">
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
              <Button onClick={restartGame} className="bg-green-500 hover:bg-green-600">
                <RefreshCw className="mr-2 h-4 w-4" />
                Restart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showRestartConfirmation} onOpenChange={setShowRestartConfirmation}>
          <DialogContent className="bg-black/90 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Restart Game?</DialogTitle>
              <DialogDescription className="text-center mt-2">
                Are you sure you want to restart the game? All progress will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center space-x-2">
              <Button onClick={() => setShowRestartConfirmation(false)} className="bg-gray-500 hover:bg-gray-600">
                Cancel
              </Button>
              <Button onClick={restartGame} className="bg-red-500 hover:bg-red-600">
                Restart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }

  return null
}


