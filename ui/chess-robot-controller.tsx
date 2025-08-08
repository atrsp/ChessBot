"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Wifi, WifiOff, RotateCcw, Plus, Minus, Send } from "lucide-react"
import mqtt from "mqtt"

// ==================== CONSTANTES CONFIGURÁVEIS ====================
const MQTT_CONFIG = {
  BROKER_URL: "mqtt://localhost:9001", // Altere para seu broker
  TOPIC: "braco/comando",
  CLIENT_ID: "chess-robot-controller",
  USERNAME: "", // Deixe vazio se não precisar
  PASSWORD: "", // Deixe vazio se não precisar
}


const SERVO_CONFIG = {
  MIN_ANGLE: 500,
  MAX_ANGLE: 2500,
  DEFAULT_BASE: 1500,
  DEFAULT_LEFT: 2400,
  DEFAULT_RIGHT: 800,
  FINE_ADJUSTMENT: 10, // Incremento para ajuste fino
}

const UI_CONFIG = {
  AUTO_PUBLISH: true, // Publicação automática
  DEBOUNCE_MS: 50, // Delay para evitar spam de mensagens
}

export default function ChessRobotController() {
  // Estados dos servos e eletroímã
  const [baseAngle, setBaseAngle] = useState([SERVO_CONFIG.DEFAULT_BASE])
  const [leftAngle, setLeftAngle] = useState([SERVO_CONFIG.DEFAULT_LEFT])
  const [rightAngle, setRightAngle] = useState([SERVO_CONFIG.DEFAULT_RIGHT])
  const [magnetActive, setMagnetActive] = useState(false)

  // Estados para comandos de posição específica
  const [baseCommand, setBaseCommand] = useState("")
  const [leftCommand, setLeftCommand] = useState("")
  const [rightCommand, setRightCommand] = useState("")

  // Estados de conexão
  const [client, setClient] = useState<any>(null)
  const clientRef = useRef<any>(null)
  const [lastMessage, setLastMessage] = useState("")
  const [messageCount, setMessageCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  // Estados de configuração
  const [brokerUrl, setBrokerUrl] = useState(MQTT_CONFIG.BROKER_URL)
  const [showSettings, setShowSettings] = useState(false)

  // Função para criar mensagem no formato: base|esquerdo|direito|magnet
  const createMessage = useCallback(() => {
    return `${baseAngle[0]}|${leftAngle[0]}|${rightAngle[0]}|${magnetActive ? 1 : 0}`
  }, [baseAngle, leftAngle, rightAngle, magnetActive])

  // Função para publicar mensagem
  const publishMessage = useCallback(() => {
    if (!clientRef.current || !isConnected) return

    const message = createMessage()
    try {
      clientRef.current.publish(MQTT_CONFIG.TOPIC, message, {}, (err: any) => {
        if (err) {
          console.error("Erro ao publicar:", err)
        } else {
          setLastMessage(message)
          setMessageCount((prev) => prev + 1)
        }
      })
    } catch (error) {
      console.error("Erro ao publicar:", error)
    }
  }, [createMessage, isConnected])

  // Funções de ajuste fino para cada servo
  const adjustBaseAngle = useCallback((increment: number) => {
    setBaseAngle((prev) => {
      const newValue = prev[0] + increment
      const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, newValue))
      return [clampedValue]
    })
  }, [])

  const adjustLeftAngle = useCallback((increment: number) => {
    setLeftAngle((prev) => {
      const newValue = prev[0] + increment
      const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, newValue))
      return [clampedValue]
    })
  }, [])

  const adjustRightAngle = useCallback((increment: number) => {
    setRightAngle((prev) => {
      const newValue = prev[0] + increment
      const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, newValue))
      return [clampedValue]
    })
  }, [])

  // Funções para definir posição específica de cada servo
  const setBasePosition = useCallback(() => {
    const position = Number.parseInt(baseCommand)
    if (isNaN(position)) return

    const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, position))
    setBaseAngle([clampedValue])
    setBaseCommand("")
  }, [baseCommand])

  const setLeftPosition = useCallback(() => {
    const position = Number.parseInt(leftCommand)
    if (isNaN(position)) return

    const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, position))
    setLeftAngle([clampedValue])
    setLeftCommand("")
  }, [leftCommand])

  const setRightPosition = useCallback(() => {
    const position = Number.parseInt(rightCommand)
    if (isNaN(position)) return

    const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, position))
    setRightAngle([clampedValue])
    setRightCommand("")
  }, [rightCommand])

  // Conectar ao broker MQTT
  const connectToBroker = useCallback(() => {
    if (clientRef.current) return // já conectado

    const options = {
      connectTimeout: 4000,
      // username: 'seu-usuario', // se necessário
      // password: 'sua-senha',
    }

    const mqttClient = mqtt.connect(brokerUrl, options)

    mqttClient.on("connect", () => {
      clientRef.current = mqttClient
      setClient(mqttClient)
      setIsConnected(true)
      console.log("Conectado ao broker MQTT")
    })

    mqttClient.on("error", (err) => {
      console.error("Erro ao conectar:", err)
      mqttClient.end()
    })
  }, [brokerUrl])

  // Desconectar do broker
  const disconnect = useCallback(() => {
    if (!clientRef.current) return

    clientRef.current.end()
    clientRef.current = null
    setClient(null)
    setIsConnected(false)
    console.log("Desconectado do broker MQTT")
  }, [])

  // Reset para posições padrão
  const resetToDefault = useCallback(() => {
    setBaseAngle([SERVO_CONFIG.DEFAULT_BASE])
    setLeftAngle([SERVO_CONFIG.DEFAULT_LEFT])
    setRightAngle([SERVO_CONFIG.DEFAULT_RIGHT])
    setMagnetActive(false)
  }, [])

  // Publicação automática com debounce
  useEffect(() => {
    if (!UI_CONFIG.AUTO_PUBLISH || !isConnected) return

    const timeoutId = setTimeout(() => {
      publishMessage()
    }, UI_CONFIG.DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [baseAngle, leftAngle, rightAngle, magnetActive, publishMessage, isConnected])

  // Conectar automaticamente ao carregar
  useEffect(() => {
    connectToBroker()
    return () => disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">♔</span>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Chess Robot Controller</CardTitle>
                  <p className="text-slate-400 text-sm">Controle robótico para movimentação de peças</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-1">
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{isConnected ? "Conectado" : "Desconectado"}</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Configurações */}
        {showSettings && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="broker-url" className="text-slate-300">
                  URL do Broker MQTT
                </Label>
                <Input
                  id="broker-url"
                  value={brokerUrl}
                  onChange={(e) => setBrokerUrl(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="ws://localhost:8083/mqtt"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={connectToBroker} disabled={isConnected} className="bg-green-600 hover:bg-green-700">
                  Conectar
                </Button>
                <Button onClick={disconnect} disabled={!isConnected} variant="destructive">
                  Desconectar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controles dos Servos */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Servo Base */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Servo Base
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                  {baseAngle[0]}°
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-8 space-y-4">
              {/* Slider Visual Customizado */}
              <div className="relative">
                <div
                  className="w-full h-12 bg-slate-700 rounded-lg cursor-pointer relative overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const percentage = x / rect.width
                    const newValue = Math.round(
                      percentage * (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE) + SERVO_CONFIG.MIN_ANGLE,
                    )
                    const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, newValue))
                    setBaseAngle([clampedValue])
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg transition-all duration-150"
                    style={{
                      width: `${((baseAngle[0] - SERVO_CONFIG.MIN_ANGLE) / (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-amber-400 cursor-grab active:cursor-grabbing"
                    style={{
                      left: `calc(${((baseAngle[0] - SERVO_CONFIG.MIN_ANGLE) / (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)) * 100}% - 12px)`,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const startX = e.clientX
                      const startValue = baseAngle[0]
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaX = e.clientX - startX
                        const deltaPercentage = deltaX / rect.width
                        const deltaValue = deltaPercentage * (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)
                        const newValue = Math.round(startValue + deltaValue)
                        const clampedValue = Math.max(
                          SERVO_CONFIG.MIN_ANGLE,
                          Math.min(SERVO_CONFIG.MAX_ANGLE, newValue),
                        )
                        setBaseAngle([clampedValue])
                      }
                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                      }
                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                  />
                </div>
              </div>

              {/* Botões de Ajuste Fino */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustBaseAngle(-SERVO_CONFIG.FINE_ADJUSTMENT)}
                  disabled={baseAngle[0] <= SERVO_CONFIG.MIN_ANGLE}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-slate-300 text-sm font-mono min-w-[60px] text-center">{baseAngle[0]}°</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustBaseAngle(SERVO_CONFIG.FINE_ADJUSTMENT)}
                  disabled={baseAngle[0] >= SERVO_CONFIG.MAX_ANGLE}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Comando de Posição Específica */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Definir Posição Específica:</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min={SERVO_CONFIG.MIN_ANGLE}
                    max={SERVO_CONFIG.MAX_ANGLE}
                    value={baseCommand}
                    onChange={(e) => setBaseCommand(e.target.value)}
                    placeholder={`${SERVO_CONFIG.MIN_ANGLE}-${SERVO_CONFIG.MAX_ANGLE}`}
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={setBasePosition}
                    disabled={!baseCommand || isNaN(Number.parseInt(baseCommand))}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-4">
                <span>{SERVO_CONFIG.MIN_ANGLE}°</span>
                <span>{SERVO_CONFIG.MAX_ANGLE}°</span>
              </div>
            </CardContent>
          </Card>

          {/* Servo Esquerdo */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Servo Esquerdo
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                  {leftAngle[0]}°
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-8 space-y-4">
              {/* Slider Visual Customizado */}
              <div className="relative">
                <div
                  className="w-full h-12 bg-slate-700 rounded-lg cursor-pointer relative overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const percentage = x / rect.width
                    const newValue = Math.round(
                      percentage * (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE) + SERVO_CONFIG.MIN_ANGLE,
                    )
                    const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, newValue))
                    setLeftAngle([clampedValue])
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg transition-all duration-150"
                    style={{
                      width: `${((leftAngle[0] - SERVO_CONFIG.MIN_ANGLE) / (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-blue-400 cursor-grab active:cursor-grabbing"
                    style={{
                      left: `calc(${((leftAngle[0] - SERVO_CONFIG.MIN_ANGLE) / (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)) * 100}% - 12px)`,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const startX = e.clientX
                      const startValue = leftAngle[0]
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaX = e.clientX - startX
                        const deltaPercentage = deltaX / rect.width
                        const deltaValue = deltaPercentage * (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)
                        const newValue = Math.round(startValue + deltaValue)
                        const clampedValue = Math.max(
                          SERVO_CONFIG.MIN_ANGLE,
                          Math.min(SERVO_CONFIG.MAX_ANGLE, newValue),
                        )
                        setLeftAngle([clampedValue])
                      }
                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                      }
                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                  />
                </div>
              </div>

              {/* Botões de Ajuste Fino */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustLeftAngle(-SERVO_CONFIG.FINE_ADJUSTMENT)}
                  disabled={leftAngle[0] <= SERVO_CONFIG.MIN_ANGLE}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-slate-300 text-sm font-mono min-w-[60px] text-center">{leftAngle[0]}°</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustLeftAngle(SERVO_CONFIG.FINE_ADJUSTMENT)}
                  disabled={leftAngle[0] >= SERVO_CONFIG.MAX_ANGLE}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Comando de Posição Específica */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Definir Posição Específica:</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min={SERVO_CONFIG.MIN_ANGLE}
                    max={SERVO_CONFIG.MAX_ANGLE}
                    value={leftCommand}
                    onChange={(e) => setLeftCommand(e.target.value)}
                    placeholder={`${SERVO_CONFIG.MIN_ANGLE}-${SERVO_CONFIG.MAX_ANGLE}`}
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={setLeftPosition}
                    disabled={!leftCommand || isNaN(Number.parseInt(leftCommand))}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-4">
                <span>{SERVO_CONFIG.MIN_ANGLE}°</span>
                <span>{SERVO_CONFIG.MAX_ANGLE}°</span>
              </div>
            </CardContent>
          </Card>

          {/* Servo Direito */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Servo Direito
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                  {rightAngle[0]}°
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-8 space-y-4">
              {/* Slider Visual Customizado */}
              <div className="relative">
                <div
                  className="w-full h-12 bg-slate-700 rounded-lg cursor-pointer relative overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const percentage = x / rect.width
                    const newValue = Math.round(
                      percentage * (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE) + SERVO_CONFIG.MIN_ANGLE,
                    )
                    const clampedValue = Math.max(SERVO_CONFIG.MIN_ANGLE, Math.min(SERVO_CONFIG.MAX_ANGLE, newValue))
                    setRightAngle([clampedValue])
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-lg transition-all duration-150"
                    style={{
                      width: `${((rightAngle[0] - SERVO_CONFIG.MIN_ANGLE) / (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-green-400 cursor-grab active:cursor-grabbing"
                    style={{
                      left: `calc(${((rightAngle[0] - SERVO_CONFIG.MIN_ANGLE) / (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)) * 100}% - 12px)`,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const startX = e.clientX
                      const startValue = rightAngle[0]
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaX = e.clientX - startX
                        const deltaPercentage = deltaX / rect.width
                        const deltaValue = deltaPercentage * (SERVO_CONFIG.MAX_ANGLE - SERVO_CONFIG.MIN_ANGLE)
                        const newValue = Math.round(startValue + deltaValue)
                        const clampedValue = Math.max(
                          SERVO_CONFIG.MIN_ANGLE,
                          Math.min(SERVO_CONFIG.MAX_ANGLE, newValue),
                        )
                        setRightAngle([clampedValue])
                      }
                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                      }
                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                  />
                </div>
              </div>

              {/* Botões de Ajuste Fino */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustRightAngle(-SERVO_CONFIG.FINE_ADJUSTMENT)}
                  disabled={rightAngle[0] <= SERVO_CONFIG.MIN_ANGLE}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-slate-300 text-sm font-mono min-w-[60px] text-center">{rightAngle[0]}°</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustRightAngle(SERVO_CONFIG.FINE_ADJUSTMENT)}
                  disabled={rightAngle[0] >= SERVO_CONFIG.MAX_ANGLE}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Comando de Posição Específica */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Definir Posição Específica:</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min={SERVO_CONFIG.MIN_ANGLE}
                    max={SERVO_CONFIG.MAX_ANGLE}
                    value={rightCommand}
                    onChange={(e) => setRightCommand(e.target.value)}
                    placeholder={`${SERVO_CONFIG.MIN_ANGLE}-${SERVO_CONFIG.MAX_ANGLE}`}
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={setRightPosition}
                    disabled={!rightCommand || isNaN(Number.parseInt(rightCommand))}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-4">
                <span>{SERVO_CONFIG.MIN_ANGLE}°</span>
                <span>{SERVO_CONFIG.MAX_ANGLE}°</span>
              </div>
            </CardContent>
          </Card>

          {/* Eletroímã */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Eletroímã
                <Badge
                  variant={magnetActive ? "default" : "secondary"}
                  className={magnetActive ? "bg-red-600" : "bg-slate-700 text-slate-300"}
                >
                  {magnetActive ? "ATIVO" : "INATIVO"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={magnetActive}
                  onCheckedChange={setMagnetActive}
                  className="data-[state=checked]:bg-red-600"
                />
                <Label className="text-slate-300">{magnetActive ? "Eletroímã ligado" : "Eletroímã desligado"}</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status e Controles */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Status e Controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Última Mensagem Enviada:</Label>
                <div className="bg-slate-700 p-3 rounded-lg font-mono text-sm text-green-400 mt-1">
                  {lastMessage || "Nenhuma mensagem enviada"}
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Estatísticas:</Label>
                <div className="space-y-1 mt-1">
                  <div className="text-sm text-slate-400">
                    Tópico: <span className="text-amber-400">{MQTT_CONFIG.TOPIC}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Mensagens enviadas: <span className="text-green-400">{messageCount}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Publicação automática:{" "}
                    <span className="text-blue-400">{UI_CONFIG.AUTO_PUBLISH ? "Ativada" : "Desativada"}</span>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="bg-slate-600" />
            <div className="flex space-x-2">
              <Button
                onClick={resetToDefault}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Posições
              </Button>
              <Button onClick={publishMessage} disabled={!isConnected} className="bg-amber-600 hover:bg-amber-700">
                Enviar Comando Manual
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview da Mensagem Atual */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Preview da Mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-600">
              <div className="text-xs text-slate-400 mb-2">Formato: base|esquerdo|direito|magnet</div>
              <div className="font-mono text-lg text-amber-400">{createMessage()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
