import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import QuestionHelper from 'app/components/QuestionHelper'
import Typography from 'app/components/Typography'
import { useAppDispatch, useAppSelector } from 'app/state/hooks'
import { selectSlippage, setSlippageInput } from 'app/state/slippage/slippageSlice'
import React, { useState } from 'react'

export const SlippageWidget = () => {
  const { i18n } = useLingui()
  const dispatch = useAppDispatch()
  const userSlippageTolerance = useAppSelector(selectSlippage)
  const [inputVal, setInputVal] = useState(userSlippageTolerance.toFixed(2))

  return (
    <div className="flex items-center md:self-start self-center gap-2">
      <div className="flex items-center">
        <Typography variant="xs" weight={700} className="text-high-emphesis">
          {i18n._(t`Slippage tolerance`)}
        </Typography>

        <QuestionHelper
          text={i18n._(t`Your transaction will revert if the price changes unfavorably by more than this percentage.`)}
        />
      </div>
      <div className="border-low-emphesis border-2 h-[36px] flex items-center px-2 rounded bg-dark-1000/40 relative">
        <input
          className="bg-transparent placeholder-low-emphesis min-w-0 font-bold w-16"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value)
            try {
              dispatch(setSlippageInput(e.target.value))
            } catch (e) {} // Ignore false inputs for now (upcoming PR to refactor)
          }}
          onBlur={() => {}}
        />
        <div className="text-low-emphesis">%</div>
      </div>
    </div>
  )
}
