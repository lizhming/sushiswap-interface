import AssetInput from '../../../../components/AssetInput'
import React from 'react'
import DepositButtons from './../DepositButtons'
import TransactionDetails from './../TransactionDetails'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import {
  formattedAmountsSelector,
  inputFieldAtom,
  mainInputAtom,
  parsedAmountsSelector,
  poolAtom,
  secondaryInputSelector,
} from './context/atoms'
import { Field } from '../../../../state/trident/add/classic'
import { ApprovalState, useActiveWeb3React, useApproveCallback, useRouterContract } from '../../../../hooks'
import { t } from '@lingui/macro'
import { PairState } from '../../../../hooks/useV2Pairs'
import { useLingui } from '@lingui/react'
import { useCurrencyBalances } from '../../../../state/wallet/hooks'
import { ZERO } from '@sushiswap/sdk'
import Button from '../../../../components/Button'
import { currenciesAtom, showReviewAtom, spendFromWalletAtom } from '../../context/atoms'

const ClassicStandardMode = () => {
  const { i18n } = useLingui()
  const { account } = useActiveWeb3React()
  const [poolState] = useRecoilValue(poolAtom)
  const [parsedAmountA, parsedAmountB] = useRecoilValue(parsedAmountsSelector)
  const formattedAmounts = useRecoilValue(formattedAmountsSelector)
  const setInputField = useSetRecoilState(inputFieldAtom)
  const setShowReview = useSetRecoilState(showReviewAtom)
  const currencies = useRecoilValue(currenciesAtom)
  const setMainInput = useSetRecoilState(mainInputAtom)
  const setSecondaryInput = useSetRecoilState(secondaryInputSelector)
  const [spendFromWallet, setSpendFromWallet] = useRecoilState(spendFromWalletAtom)
  const balances = useCurrencyBalances(account ?? undefined, currencies)

  const router = useRouterContract()
  const [approveA, approveACallback] = useApproveCallback(parsedAmountA, router?.address)
  const [approveB, approveBCallback] = useApproveCallback(parsedAmountB, router?.address)

  let error = !account
    ? i18n._(t`Connect Wallet`)
    : poolState === PairState.INVALID
    ? i18n._(t`Invalid pair`)
    : !parsedAmountA?.greaterThan(ZERO) || !parsedAmountB?.greaterThan(ZERO)
    ? i18n._(t`Enter an amount`)
    : parsedAmountA && balances[0]?.lessThan(parsedAmountA)
    ? i18n._(t`Insufficient ${currencies[0]?.symbol} balance`)
    : parsedAmountB && balances?.length && balances[1]?.lessThan(parsedAmountB)
    ? i18n._(t`Insufficient ${currencies[1]?.symbol} balance`)
    : ''

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 px-5">
        <AssetInput
          value={formattedAmounts[0]}
          currency={currencies[0]}
          onChange={(val) => {
            setInputField(Field.CURRENCY_A)
            setMainInput(val)
          }}
          headerRight={
            <AssetInput.WalletSwitch onChange={() => setSpendFromWallet(!spendFromWallet)} checked={spendFromWallet} />
          }
          spendFromWallet={spendFromWallet}
        />
        <AssetInput
          value={formattedAmounts[1]}
          currency={currencies[1]}
          onChange={(val) => {
            setInputField(Field.CURRENCY_B)
            setSecondaryInput(val)
          }}
          spendFromWallet={spendFromWallet}
        />
        <div className="grid grid-cols-2 gap-3">
          {[ApprovalState.NOT_APPROVED, ApprovalState.PENDING].includes(approveA) && (
            <Button.Dotted pending={approveA === ApprovalState.PENDING} color="blue" onClick={approveACallback}>
              {approveA === ApprovalState.PENDING
                ? i18n._(t`Approving ${parsedAmountA?.currency.symbol}`)
                : i18n._(t`Approve ${parsedAmountA?.currency.symbol}`)}
            </Button.Dotted>
          )}
          {[ApprovalState.NOT_APPROVED, ApprovalState.PENDING].includes(approveB) && (
            <Button.Dotted pending={approveB === ApprovalState.PENDING} color="blue" onClick={approveBCallback}>
              {approveB === ApprovalState.PENDING
                ? i18n._(t`Approving ${parsedAmountB?.currency.symbol}`)
                : i18n._(t`Approve ${parsedAmountB?.currency.symbol}`)}
            </Button.Dotted>
          )}
          {approveA === ApprovalState.APPROVED && approveB === ApprovalState.APPROVED && (
            <div className="col-span-2">
              <DepositButtons
                errorMessage={error}
                inputValid={true}
                onMax={() => {}}
                isMaxInput={false}
                onClick={() => setShowReview(true)}
              />
            </div>
          )}
        </div>
      </div>
      {!error && (
        <div className="flex flex-col px-5">
          <TransactionDetails />
        </div>
      )}
    </div>
  )
}

export default ClassicStandardMode
