import { View, StyleSheet, Dimensions } from 'react-native'
import { Svg, Path, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg'
import { colors } from '@/constants/theme'

interface MiniChartProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showGradient?: boolean
  isDark?: boolean
}

export function MiniChart({ 
  data, 
  width = Dimensions.get('window').width - 48, 
  height = 120,
  color = colors.primary,
  showGradient = true,
  isDark
}: MiniChartProps) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  // Create path for line
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 20) - 10
    return { x, y }
  })

  const linePath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    const prevPoint = points[index - 1]
    const cpX = (prevPoint.x + point.x) / 2
    return `${path} Q ${cpX} ${prevPoint.y}, ${point.x} ${point.y}`
  }, '')

  // Create path for gradient fill
  const gradientPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        
        {showGradient && (
          <Path
            d={gradientPath}
            fill="url(#chartGradient)"
          />
        )}
        
        <Path
          d={linePath}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
})
