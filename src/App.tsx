import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import copy from 'copy-to-clipboard';


function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface JournalItem {
  id: string
  sourceText: string
  creditPost: string
  debitPost: string
}

const newJournalItem = (id: string, sourceText: string, debitPost: string, creditPost: string): JournalItem => {
  return {
    id,
    sourceText,
    debitPost,
    creditPost,
  };
}


const journalOpts: JournalItem[] = [
  newJournalItem('shareholders_invested', 'shareholders invested', 'Cash', 'Shareholder cap'),
  newJournalItem('got_loan', 'got a loan', 'Cash', 'Bank Loan'),
  newJournalItem('paid_back_loan', 'downpayment on loan', 'Bank Loan', 'Cash'),

  newJournalItem('bought_ppe_cash', ' bought equipment (paid cash)', 'Property, Plant & Equipment', 'Cash'),
  newJournalItem('bought_ppe_credit', ' bought equipment (paid credit)', 'Property, Plant & Equipment', 'Accounts payable'),

  newJournalItem('bought_inventory_cash', ' bought inventory (cash)', 'Inventory', 'Cash'),
  newJournalItem('bought_inventory_credit', ' bought inventory (credit)', 'Inventory', 'Accounts payable'),

  newJournalItem('goods_sold_account', ' sold goods on account', 'Accounts Receivable', 'Sales Revenue'),
  newJournalItem('goods_sold_cash', ' sold goods got cash', 'Cash', 'Sales Revenue'),

  newJournalItem('prepaid_rent_cash', 'rented offices for the whole of a year (cash)', 'Prepaid rent', 'Cash'),
  newJournalItem('prepaid_insurance', 'paid for a one-year insurance policy (cash)', 'Prepaid Insurance', 'Cash'),

  newJournalItem('received_payment_prev_sales', 'received payment from clients from previous sales', 'Cash', 'Accounts Receivable'),
  newJournalItem('paid_inventories_purchased_account', 'paid for inventories purchased on account', 'Accounts payable', 'Cash'),
  newJournalItem('paid_salaries', '  paid for the salaries of the first semester of the year.', 'Salaries and Wages Expense ', 'Cash'),

  newJournalItem('interest_income_earned', 'Interest income earned on cash and cash equivalent paid in cash', 'Cash', 'Interest Income'),
  newJournalItem('interest_expense_paid', 'Interest expense paid in cash', 'Interest Expenses', 'Interest Income'),

];

interface AddedItem {
  item: JournalItem,
  date: string,
  sum: number
}

interface Balance {
  salesRevenue: number
  costOfGoodsSold: number
  grossProfit: number
  salariesAndWageExpense: number
  rentExpense: number
  depreciationExpense: number
  insuranceExpense: number
  incomeFromOperations: number
  interestExpense: number
  netIncome: number
}

interface Adjustment {
  date: string
  post: string
  useValueFromBalance: boolean
  valueFromBalanceDurationPeriod: number
  valueFromBalanceUsagePeriod: number
  customValue: number
}

function App() {

  // journalImport
  // journalExport
  const journalImport = () => {
    const e = prompt("import strting");
    if (e === null) return;

    const importedObject = JSON.parse(e as string);

    const { addedItems, adjustments, incomeStatementAsOf,
      depreciationSum,
      interestPaidSum } = importedObject;

    setAddedItems(addedItems);
    setAdjustments(adjustments);
    setIncomeStatementAsOf(incomeStatementAsOf);
    setDepreciationSum(depreciationSum);
    setInterestPaidSum(interestPaidSum);
  }

  const journalExport = () => {

    const exportObject = {
      addedItems,
      adjustments,
      incomeStatementAsOf,
      depreciationSum,
      interestPaidSum
    }

    const exportVal = JSON.stringify(exportObject);
    console.group('Journal export');
    console.log(exportVal);
    copy(exportVal);
    console.groupEnd();
    alert('Copied to clipboard');
  }

  const [selectJournalItem, setSelectJournalItem] = useState('');
  const [selectDate, setSelectDate] = useState('');
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const [selectSum, setSelectSum] = useState(0);
  const [incomeStatementAsOf, setIncomeStatementAsOf] = useState('');

  const [depreciationSum, setDepreciationSum] = useState(0);
  const [interestPaidSum, setInterestPaidSum] = useState(0);

  // Adjustments
  const [adjustmentDate, setAdjustmentDate] = useState('');
  const [adjustmentPost, setAdjustmentPost] = useState('');
  const [adjustmentType, setAdjustmentType] = useState(0);

  const [adjustmentDuration, setAdjustmentDuration] = useState(0);
  const [adjustmentUsage, setAdjustmentUsage] = useState(0);
  const [adjustmentOverrideValue, setAdjustmentOverrideValue] = useState(0);


  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  const addAdjustment = () => {
    if (adjustmentPost === '') return;
    const newAdjustment: Adjustment = {
      date: adjustmentDate,
      post: adjustmentPost,
      useValueFromBalance: adjustmentType === 0,
      customValue: adjustmentOverrideValue,
      valueFromBalanceDurationPeriod: adjustmentDuration,
      valueFromBalanceUsagePeriod: adjustmentUsage
    }
    setAdjustments(adjustments.concat([newAdjustment]));
    setAdjustmentDate('');
    setAdjustmentPost('');
    setAdjustmentType(0);
    setAdjustmentDuration(0);
    setAdjustmentUsage(0);
    setAdjustmentOverrideValue(0);
  }


  // Build the balance
  const balance: Balance = {
    salesRevenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    salariesAndWageExpense: 0,
    rentExpense: 0,
    depreciationExpense: 0,
    insuranceExpense: 0,
    incomeFromOperations: 0,
    interestExpense: 0,
    netIncome: 0,
  };


  for (let item of addedItems) {
    const sourceText = item.item.id;
    const sum = item.sum;
    // prepaid_rent_cash
    switch (sourceText) {
      case 'goods_sold_account':
        // case 'received_payment_prev_sales':
        balance.salesRevenue += sum;
        break;
      case 'bought_inventory_cash':
      case 'bought_inventory_credit':
        balance.costOfGoodsSold += sum;
        break;
      case 'prepaid_rent_cash':
        balance.rentExpense += sum;
        break;
      case 'bought_inventory_credit':
        break;
      case 'paid_salaries':
        balance.salariesAndWageExpense += sum;
        break;
      case 'prepaid_insurance':
        balance.insuranceExpense += sum;
        break;
    }
  }

  balance.depreciationExpense = depreciationSum;
  balance.interestExpense = interestPaidSum;

  const preAdjustmentBalance = JSON.parse(JSON.stringify(balance));

  // Calculate in adjustments
  const appliedAdjustments = [];
  for (let adj of adjustments) {

    if (adj.post === 'inventory') {

      const prevValue = (balance as any)['costOfGoodsSold'] as number;
      const changeInCostOfGoods = prevValue - adj.customValue;

      (balance as any)['costOfGoodsSold'] = changeInCostOfGoods;
      appliedAdjustments.push({ date: adj.date, post: 'costOfGoodsSold', adjustmentValue: changeInCostOfGoods });

    } else {
      let newPostValue = 0;
      if (adj.useValueFromBalance) {
        const prevValue = (balance as any)[adj.post] as number;
        newPostValue = (prevValue / adj.valueFromBalanceDurationPeriod) * adj.valueFromBalanceUsagePeriod;
      } else {
        newPostValue = adj.customValue;
      }
      (balance as any)[adj.post] = newPostValue;
      appliedAdjustments.push({ date: adj.date, post: adj.post, adjustmentValue: newPostValue });
    }


  }

  // Calculate balance sum numbers
  // Balance
  balance.grossProfit = balance.salesRevenue - balance.costOfGoodsSold;
  balance.incomeFromOperations =
    balance.grossProfit - balance.salariesAndWageExpense - balance.rentExpense - balance.depreciationExpense - balance.insuranceExpense;

  balance.netIncome = balance.incomeFromOperations - balance.interestExpense;

  // pre Adjustment Balance
  preAdjustmentBalance.grossProfit = preAdjustmentBalance.salesRevenue - preAdjustmentBalance.costOfGoodsSold;
  preAdjustmentBalance.incomeFromOperations =
    preAdjustmentBalance.grossProfit - preAdjustmentBalance.salariesAndWageExpense - preAdjustmentBalance.rentExpense - preAdjustmentBalance.depreciationExpense - preAdjustmentBalance.insuranceExpense;

  preAdjustmentBalance.netIncome = preAdjustmentBalance.incomeFromOperations - preAdjustmentBalance.interestExpense;


  // Calculate financial position
  let financialPositionObj = {
    // lhs
    ppe: 0,
    accDepr: preAdjustmentBalance.depreciationExpense,
    netPPE: 0,
    prepaidInsurance: 0,
    inventory: preAdjustmentBalance.costOfGoodsSold,
    prepaidRent: preAdjustmentBalance.rentExpense,
    accountsReceivable: 0,
    cash: 0,
    totalCurrentAssets: 0,
    totalAssets: 0,

    // rhs
    shareCap: 0,
    retainedEarnings: balance.netIncome,
    totalEquity: 0,
    bankLoan: 0,
    accountsPayable: 0,
    interestPayable: preAdjustmentBalance.interestExpense,
    totalCurrentLiabilities: 0,
    totalEquityAndLiabilities: 0,
  }

  const processLineItem = (postName: string, finPosName: string, item: AddedItem) => {
    if (item.item.debitPost.toLowerCase().trim() === postName.toLowerCase().trim()) (financialPositionObj as any)[finPosName] += item.sum;
    if (item.item.creditPost.toLowerCase().trim() === postName.toLowerCase().trim()) (financialPositionObj as any)[finPosName] -= item.sum;
  }

  // Add line items
  for (let item of addedItems) {
    processLineItem('Property, Plant & Equipment', 'ppe', item);
    processLineItem('Accounts Receivable', 'accountsReceivable', item);
    processLineItem('Cash', 'cash', item);
    processLineItem('Shareholder cap', 'shareCap', item);
    processLineItem('Bank Loan', 'bankLoan', item);

    processLineItem('Accounts payable', 'accountsPayable', item);

  //     accountsPayable
  // interestPayable
  }

  // If adjustment -- clear existing value
  const adjustmentPostNames = appliedAdjustments.map((el) => { return el.post });

  if (adjustmentPostNames.includes('depreciationExpense')) financialPositionObj.accDepr = 0;
  if (adjustmentPostNames.includes('insuranceExpense')) financialPositionObj.prepaidInsurance = 0;
  // if (adjustmentPostNames.includes('interestExpense')) financialPositionObj.interestExpense = 0;
  // if (adjustmentPostNames.includes('rentExpense')) financialPositionObj.prepaidRent = 0;

  // Insurance
  financialPositionObj.prepaidInsurance = preAdjustmentBalance.insuranceExpense - balance.insuranceExpense;

  // Add adjustments 
  for (let applAdj of appliedAdjustments) {
    const {post, adjustmentValue} = applAdj;
    if (post === 'depreciationExpense') financialPositionObj.accDepr += adjustmentValue;
    if (post === 'costOfGoodsSold') financialPositionObj.inventory -= adjustmentValue;
    if (post === 'rentExpense') financialPositionObj.prepaidRent -= adjustmentValue;
    if (post === 'interestExpense') financialPositionObj.interestPayable -= adjustmentValue;
  }

  // Calculate net ops
  financialPositionObj.netPPE = financialPositionObj.ppe - financialPositionObj.accDepr;
  financialPositionObj.totalCurrentAssets = financialPositionObj.prepaidInsurance + financialPositionObj.inventory + financialPositionObj.prepaidRent + financialPositionObj.accountsReceivable + financialPositionObj.cash;
  financialPositionObj.totalAssets = financialPositionObj.netPPE + financialPositionObj.totalCurrentAssets;

  financialPositionObj.totalEquity = (-financialPositionObj.shareCap) + financialPositionObj.retainedEarnings;
  
  financialPositionObj.totalCurrentLiabilities = -financialPositionObj.accountsPayable + financialPositionObj.interestPayable;
  financialPositionObj.totalEquityAndLiabilities = financialPositionObj.totalEquity + (-financialPositionObj.bankLoan) + financialPositionObj.totalCurrentLiabilities;

  // totalCurrentLiabilities
  // totalEquityAndLiabilities

  return (
    <div className="App">
      <h1>Journaling tool</h1>
      <h1>Inputs</h1>
      <h2>Select item:</h2>
      <select value={selectJournalItem} onChange={(e) => { setSelectJournalItem(e.target.value); }}>
        <option></option>
        {journalOpts.map((el) => { return <option value={el.id}>{el.sourceText}</option> })}
      </select>


      <h2>Enter date:</h2>
      <input type="string" placeholder="Date" value={selectDate} onChange={(e) => { setSelectDate(e.target.value); }} />


      <h2>Enter amt:</h2>
      <input type="number" placeholder="Sum" value={selectSum} onChange={(e) => { setSelectSum(Number(e.target.value)); }} />

      <button onClick={(e) => {

        const journOpt = journalOpts.find((el) => { return el.id === selectJournalItem; })
        if (journOpt === undefined) return;

        setAddedItems(addedItems.concat([{ item: journOpt, sum: selectSum, date: selectDate }]));
        setSelectJournalItem('');
        setSelectDate('');
        setSelectSum(0);

      }}>Add item</button>

      <hr />
      <h1>Journaling</h1>
      <button onClick={(el) => { journalImport(); }}>Import</button>
      <button onClick={(el) => { journalExport(); }}>Export</button>
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Date</th>
            <th style={{ minWidth: 300 }}>Item</th>
            <th style={{ minWidth: 150 }}>Dr.</th>
            <th style={{ minWidth: 150 }}>Cr.</th>
          </tr>
        </thead>
        <tbody>
          {addedItems.map((el, index) => {
            return <>
              <tr className='first-row'>
                <td>{index + 1}</td>
                <td>{el.date}</td>
                <td className='line-debit'>{el.item.debitPost}</td>
                <td>{numberWithCommas(el.sum)}</td>
                <td></td>
              </tr>
              <tr className='second-row'>
                <td></td>
                <td></td>
                <td className='line-credit'>{el.item.creditPost}</td>
                <td></td>
                <td>{numberWithCommas(el.sum)}</td>
              </tr>
            </>;
          })}
        </tbody>
      </table>
      <hr />
      <h1>Manual inputs</h1>
      <h2>As of (31.X):</h2>
      <input type="text" placeholder="As of (END MONTH)" value={incomeStatementAsOf} onChange={(e) => { setIncomeStatementAsOf(e.target.value); }} />
      <h3>Depreciation (per year):</h3>
      <input type="number" placeholder="Sum" value={depreciationSum} onChange={(e) => { setDepreciationSum(Number(e.target.value)); }} />
      <h3>NET Interest paid: (NB -- although interest expense is recorded in journal, this must be calculated manually here)</h3>
      <input type="number" placeholder="Sum" value={interestPaidSum} onChange={(e) => { setInterestPaidSum(Number(e.target.value)); }} />

      <h2>Add adjustment:</h2>
      <label htmlFor="adjustment_date">Date</label>
      <input id="adjustment_date" placeholder="Adjustment date" value={adjustmentDate} onChange={(e) => { setAdjustmentDate(e.target.value) }} />

      <label htmlFor="adjustment_post">Post</label>
      <select id="adjustment_post" value={adjustmentPost} onChange={(e) => {
        const newPost = e.target.value;
        setAdjustmentPost(newPost)

        if (newPost === 'inventory') {
          setAdjustmentType(1);
        }

      }}>
        <option value={''}></option>
        <option value={'depreciationExpense'}>Depreciation</option>
        <option value={'interestExpense'}>Interest</option>
        <option value={'rentExpense'}>Rent expense</option>
        <option value={'insuranceExpense'}>Insurance expense</option>
        <option value={'inventory'}>Inventory</option>
      </select>

      {adjustmentPost !== 'inventory' && <><label htmlFor="adjustment_base_value">Base value</label>
        <select id="adjustment_base_value" value={adjustmentType} onChange={(e) => { setAdjustmentType(Number(e.target.value)); }}>
          <option value={0}>Use value from balance</option>
          <option value={1}>Override value</option>
        </select></>}


      {adjustmentType === 0 && <><label htmlFor="adjustment_base_value_input">Duration of element</label>
        <input id="adjustment_base_value_input" placeholder="Duration" value={adjustmentDuration} onChange={(e) => { setAdjustmentDuration(Number(e.target.value)) }} />
        <label htmlFor="adjustment_usage_period_input">Usage period</label>
        <input id="adjustment_usage_period_input" placeholder="Usage period" value={adjustmentUsage} onChange={(e) => { setAdjustmentUsage(Number(e.target.value)) }} /></>}
      {adjustmentType === 1 && <>
        <label htmlFor="adjustment_override_value">
          {adjustmentPost === 'inventory' && <>Newfound Inventory Value</>}
          {adjustmentPost !== 'inventory' && <>Override value</>}
        </label>
        <input id="adjustment_override_value" placeholder="Override value" value={adjustmentOverrideValue} onChange={(e) => { setAdjustmentOverrideValue(Number(e.target.value)) }} />
      </>}

      <button onClick={(e) => { addAdjustment(); }}>Add adjustment</button>

      <h3>Adjustments:</h3>
      {JSON.stringify(adjustments)}
      <h3>Applied adj:</h3>
      {JSON.stringify(appliedAdjustments)}
      <ul>
        {appliedAdjustments.map((el) => {
          return <li>{el.post}: {numberWithCommas(el.adjustmentValue)} (before: {numberWithCommas((preAdjustmentBalance as any)[el.post])})</li>
        })}
      </ul>


      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Date</th>
            <th style={{ minWidth: 300 }}>Item</th>
            <th style={{ minWidth: 150 }}>Dr.</th>
            <th style={{ minWidth: 150 }}>Cr.</th>
          </tr>
        </thead>
        <tbody>
          {appliedAdjustments.map((el, index) => {

            let creditItem = '';
            let debitItem = '';

            // depreciationExpense
            // interestExpense
            // rentExpense
            // insuranceExpense
            // inventory

            switch (el.post) {
              case 'depreciationExpense':
                debitItem = 'Depreciation expense';
                creditItem = 'Acc. Depreciation PP&E';
                break;
              case 'insuranceExpense':
                debitItem = 'Insurance Expense';
                creditItem = 'Prepaid Insurance';
                break;
              case 'rentExpense':
                debitItem = 'Rent expense';
                creditItem = 'Prepaid rent';
                break;
              case 'costOfGoodsSold':
                debitItem = 'Cost of goods sold';
                creditItem = 'Inventory';
                break;
              case 'interestExpense':
                debitItem = 'Interest Expense';
                creditItem = 'Interest Payable ';
                break;

            }


            const originalTx = addedItems.length;

            return <>
              <tr className='first-row'>
                <td>{originalTx + index + 1}</td>
                <td>{el.date}</td>
                <td className='line-debit'>{debitItem}</td>
                <td>{numberWithCommas(el.adjustmentValue)}</td>
                <td></td>
              </tr>
              <tr className='second-row'>
                <td></td>
                <td></td>
                <td className='line-credit'>{creditItem}</td>
                <td></td>
                <td>{numberWithCommas(el.adjustmentValue)}</td>
              </tr>
            </>
          })}
        </tbody>
      </table>

      <hr />
      <h1>IncomE statement as of 31.{incomeStatementAsOf}</h1>
      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Value (pre adjustment)</th>
            <th>Value (after adjustment)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sales revenue</td>
            <td>{numberWithCommas(preAdjustmentBalance.salesRevenue)}</td>
            <td>{numberWithCommas(balance.salesRevenue)}</td>
          </tr>
          <tr>
            <td>Cost of goods sold</td>
            <td>-{numberWithCommas(preAdjustmentBalance.costOfGoodsSold)}</td>
            <td>-{numberWithCommas(balance.costOfGoodsSold)}</td>
          </tr>
          <tr>
            <td>Gross profit</td>
            <td><strong>{numberWithCommas(preAdjustmentBalance.grossProfit)}</strong></td>
            <td><strong>{numberWithCommas(balance.grossProfit)}</strong></td>
          </tr>
          <tr>
            <td>Salaries and Wages Expense</td>
            <td>-{numberWithCommas(preAdjustmentBalance.salariesAndWageExpense)}</td>
            <td>-{numberWithCommas(balance.salariesAndWageExpense)}</td>
          </tr>
          <tr>
            <td>Rent Expense</td>
            <td>-{numberWithCommas(preAdjustmentBalance.rentExpense)}</td>
            <td>-{numberWithCommas(balance.rentExpense)}</td>
          </tr>
          <tr>
            <td>Depreciation Expense</td>
            <td>-{numberWithCommas(preAdjustmentBalance.depreciationExpense)}</td>
            <td>-{numberWithCommas(balance.depreciationExpense)}</td>
          </tr>
          <tr>
            <td>Insurance Expense</td>
            <td>-{numberWithCommas(preAdjustmentBalance.insuranceExpense)}</td>
            <td>-{numberWithCommas(balance.insuranceExpense)}</td>
          </tr>
          <tr>
            <td>Income from operations</td>
            <td>{numberWithCommas(preAdjustmentBalance.incomeFromOperations)}</td>
            <td>{numberWithCommas(balance.incomeFromOperations)}</td>
          </tr>
          <tr>
            <td>Interest Expense</td>
            <td>-{numberWithCommas(preAdjustmentBalance.interestExpense)}</td>
            <td>-{numberWithCommas(balance.interestExpense)}</td>
          </tr>
          <tr>
            <td>Net Income</td>
            <td>{numberWithCommas(preAdjustmentBalance.netIncome)}</td>
            <td>{numberWithCommas(balance.netIncome)}</td>
          </tr>
        </tbody>
      </table>

      <hr />
      <h1>Financial Position as of 31.{incomeStatementAsOf}</h1>
      <table>
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2}><u>Assets</u></td>
          </tr>
          <tr>
            <td>Property, Plant and Equipment</td>
            <td>{numberWithCommas(financialPositionObj.ppe)}</td>
          </tr>
          <tr>
            <td>Accumulate Depraciation </td>
            <td>-{numberWithCommas(financialPositionObj.accDepr)}</td>
          </tr>
          <tr>
            <td>Net PP&E </td>
            <td><strong>{numberWithCommas(financialPositionObj.netPPE)}</strong></td>
          </tr>
          <tr>
            <td colSpan={2}><i>Current assets</i></td>
          </tr>
          <tr>
            <td>Prepaid Insurance</td>
            <td>{numberWithCommas(financialPositionObj.prepaidInsurance)}</td>
          </tr>
          <tr>
            <td>Inventory</td>
            <td>{numberWithCommas(financialPositionObj.inventory)}</td>
          </tr>
          <tr>
            <td>Prepaid Rent</td>
            <td>{numberWithCommas(financialPositionObj.prepaidRent)}</td>
          </tr>
          <tr>
            <td>Accounts Receivable</td>
            <td>{numberWithCommas(financialPositionObj.accountsReceivable)}</td>
          </tr>
          <tr>
            <td>Cash</td>
            <td>{numberWithCommas(financialPositionObj.cash)}</td>
          </tr>
          <tr>
            <td>Total Current Assets</td>
            <td><strong>{numberWithCommas(financialPositionObj.totalCurrentAssets)}</strong></td>
          </tr>
          <tr>
            <td><strong>Total Assets</strong></td>
            <td><strong>{numberWithCommas(financialPositionObj.totalAssets)}</strong></td>
          </tr>
          <tr>
            <td colSpan={2}><u>Equity and Liabilities</u></td>
          </tr>
          <tr>
            <td colSpan={2}><i>Equity</i></td>
          </tr>
          <tr>
            <td>Share Capital- Ordinary</td>
            <td>{numberWithCommas(-financialPositionObj.shareCap)}</td>
          </tr>
          <tr>
            <td>Retained Earnings (deficit)</td>
            <td>{numberWithCommas(financialPositionObj.retainedEarnings)}</td>
          </tr>
          <tr>
            <td>Total Equity</td>
            <td><strong>{numberWithCommas(financialPositionObj.totalEquity)}</strong></td>
          </tr>
          <tr>
            <td colSpan={2}><i>Non-current Liabilities</i></td>
          </tr>
          <tr>
            <td>Bank Loan</td>
            <td>{numberWithCommas(-financialPositionObj.bankLoan)}</td>
          </tr>
          <tr>
            <td colSpan={2}><i>Current Liabilities</i></td>
          </tr>
          <tr>
            <td>Accounts Payable</td>
            <td>{numberWithCommas(-financialPositionObj.accountsPayable)}</td>
          </tr>
          <tr>
            <td>Interest Payable</td>
            <td>{numberWithCommas(financialPositionObj.interestPayable)}</td>
          </tr>
          <tr>
            <td>Total Current Liabilities</td>
            <td>{numberWithCommas(financialPositionObj.totalCurrentLiabilities)}</td>
          </tr>
          <tr>
            <td><strong>Total Equity and Liabilities</strong></td>
            <td><strong>{numberWithCommas(financialPositionObj.totalEquityAndLiabilities)}</strong></td>
          </tr>
        </tbody>
      </table>


    </div>
  );
}

export default App;
