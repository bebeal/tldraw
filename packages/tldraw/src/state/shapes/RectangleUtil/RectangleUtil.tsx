import * as React from 'react'
import { Utils, SVGContainer } from '@tldraw/core'
import { RectangleShape, DashStyle, TDShapeType, TDMeta } from '~types'
import { GHOSTED_OPACITY } from '~constants'
import { TDShapeUtil } from '../TDShapeUtil'
import {
  defaultStyle,
  getShapeStyle,
  getBoundsRectangle,
  transformRectangle,
  getFontStyle,
  transformSingleRectangle,
} from '~state/shapes/shared'
import { TextLabel } from '../shared/TextLabel'
import { getRectangleIndicatorPathTDSnapshot } from './helpers'
import { DrawRectangle } from './components/DrawRectangle'
import { DashedRectangle } from './components/DashedRectangle'
import { BindingIndicator } from './components/BindingIndicator'

type T = RectangleShape
type E = SVGSVGElement

export class RectangleUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Rectangle as const

  canBind = true

  canClone = true

  canEdit = true

  getShape = (props: Partial<T>): T => {
    return Utils.deepMerge<T>(
      {
        id: 'id',
        type: TDShapeType.Rectangle,
        name: 'Rectangle',
        parentId: 'page',
        childIndex: 1,
        point: [0, 0],
        size: [1, 1],
        rotation: 0,
        style: defaultStyle,
        text: '',
      },
      props
    )
  }

  Component = TDShapeUtil.Component<T, E, TDMeta>(
    (
      {
        shape,
        isEditing,
        isBinding,
        isSelected,
        isGhost,
        meta,
        events,
        onShapeBlur,
        onShapeChange,
      },
      ref
    ) => {
      const { id, size, style, text } = shape
      const font = getFontStyle(shape.style)
      const styles = getShapeStyle(style, meta.isDarkMode)
      const Component = style.dash === DashStyle.Draw ? DrawRectangle : DashedRectangle

      const handleTextChange = React.useCallback(
        (text: string) => {
          onShapeChange?.({ id, text })
        },
        [onShapeChange]
      )

      return (
        <>
          <TextLabel
            isEditing={isEditing}
            onChange={handleTextChange}
            onBlur={onShapeBlur}
            color={styles.stroke}
            font={font}
            text={text}
          />
          <SVGContainer
            ref={ref}
            id={shape.id + '_svg'}
            opacity={isGhost ? GHOSTED_OPACITY : 1}
            {...events}
          >
            {isBinding && <BindingIndicator strokeWidth={styles.strokeWidth} size={size} />}
            <Component id={id} style={style} isSelected={isSelected} size={size} />
          </SVGContainer>
        </>
      )
    }
  )

  Indicator = TDShapeUtil.Indicator<T>(({ shape }) => {
    const { id, style, size } = shape

    const styles = getShapeStyle(style, false)
    const sw = styles.strokeWidth

    if (style.dash === DashStyle.Draw) {
      return <path d={getRectangleIndicatorPathTDSnapshot(id, style, size)} />
    }

    return (
      <rect
        x={sw}
        y={sw}
        rx={1}
        ry={1}
        width={Math.max(1, size[0] - sw * 2)}
        height={Math.max(1, size[1] - sw * 2)}
      />
    )
  })

  getBounds = (shape: T) => {
    return getBoundsRectangle(shape, this.boundsCache)
  }

  shouldRender = (prev: T, next: T) => {
    return next.size !== prev.size || next.style !== prev.style || next.text !== prev.text
  }

  transform = transformRectangle

  transformSingle = transformSingleRectangle
}
