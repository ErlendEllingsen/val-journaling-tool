import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import copy from 'copy-to-clipboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Button, Col, Container, Row } from 'react-bootstrap';


function numberWithCommas(x: number) {
  return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
  newJournalItem('got_loan_lt', 'got a loan (LT)', 'Cash', 'Bank Loan (LT)'),
  newJournalItem('got_loan_st', 'got a loan (ST)', 'Cash', 'Bank Loan (ST)'),
  newJournalItem('paid_back_loan_lt', 'downpayment on loan (LT)', 'Bank Loan (LT)', 'Cash'),
  newJournalItem('paid_back_loan_st', 'downpayment on loan (ST)', 'Bank Loan (ST)', 'Cash'),

  newJournalItem('bought_ppe_cash', ' bought ppe/equipment/machinery (paid cash)', 'Property, Plant & Equipment', 'Cash'),
  newJournalItem('bought_ppe_credit', ' bought ppe/equipment/machinery (paid credit)', 'Property, Plant & Equipment', 'Accounts payable'),

  newJournalItem('bought_inventory_cash', ' bought inventory (cash)', 'Inventory', 'Cash'),
  newJournalItem('bought_inventory_credit', ' bought inventory (credit)', 'Inventory', 'Accounts payable'),

  newJournalItem('goods_reduced_accounts', ' reduce inventory (against cost of goods sold)', 'Cost of goods sold', 'Inventory'),


  newJournalItem('goods_sold_account', ' sold goods on account', 'Accounts Receivable', 'Sales Revenue'),
  newJournalItem('goods_sold_cash', ' sold goods got cash', 'Cash', 'Sales Revenue'),

  newJournalItem('prepaid_rent_cash', 'rented offices for the whole of a year (cash)', 'Prepaid rent', 'Cash'),
  newJournalItem('prepaid_insurance', 'paid for a one-year insurance policy (cash)', 'Prepaid Insurance', 'Cash'),

  newJournalItem('received_payment_prev_sales', 'received payment from clients from previous sales', 'Cash', 'Accounts Receivable'),
  newJournalItem('paid_inventories_purchased_account', 'paid for inventories purchased on account', 'Accounts payable', 'Cash'),
  newJournalItem('paid_salaries', '  paid for the salaries of the first semester of the year.', 'Salaries and Wages Expense ', 'Cash'),

  newJournalItem('interest_income_earned', 'Interest income earned on cash and cash equivalent paid in cash', 'Cash', 'Interest Income'),
  newJournalItem('interest_expense_paid', 'Interest expense paid in cash', 'Interest Expenses', 'Cash'),

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
      interestPaidSum, tansferNetIncomeToRetainedEarnings, initBalance } = importedObject;

    setAddedItems(addedItems);
    setAdjustments(adjustments);
    setIncomeStatementAsOf(incomeStatementAsOf);
    setDepreciationSum(depreciationSum);
    setInterestPaidSum(interestPaidSum);
    setTransferNetIncomeToRetainedEarnings(transferNetIncomeToRetainedEarnings);
    setInitBalance(initBalance);
  }

  const journalExport = () => {

    const exportObject = {
      addedItems,
      adjustments,
      incomeStatementAsOf,
      depreciationSum,
      interestPaidSum,
      transferNetIncomeToRetainedEarnings,
      initBalance
    }

    const exportVal = JSON.stringify(exportObject);
    console.group('Journal export');
    console.log(exportVal);
    copy(exportVal);
    console.groupEnd();
    alert('Copied to clipboard');
  }

  const [initBalance, setInitBalance] = useState({
    // lhs
    PPE: 0,
    accDepr: 0,
    inventory: 0,
    accountsReceivable: 0,
    cash: 0,
    // rhs
    shareCap: 0,
    retainedEarnings: 0,
    bankLoanST: 0,
    bankLoanLT: 0,
    accountsPayable: 0,
  });

  const initBalanceTotalCurrentAssets = initBalance.inventory + initBalance.accountsReceivable + initBalance.cash;
  const initBalanceTotalAssets = (initBalance.PPE - initBalance.accDepr) + initBalanceTotalCurrentAssets;

  const initBalanceTotalEquity = initBalance.shareCap + initBalance.retainedEarnings;

  const initBalanceTotalCurrentLiabilities = initBalance.bankLoanST + initBalance.accountsPayable; 
  const initBalanceTotalLiabilities = initBalance.bankLoanLT + initBalanceTotalCurrentLiabilities; 
  const initBalanceTotalEquityAndLiabilities = initBalanceTotalEquity + initBalanceTotalLiabilities;

  const setInitBalanceValue = (post: string, value: Number) => {
    setInitBalance({...initBalance, [post]: value})
  }

  const [selectJournalItem, setSelectJournalItem] = useState('');
  const [selectDate, setSelectDate] = useState('');
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const [selectSum, setSelectSum] = useState(0);
  const [incomeStatementAsOf, setIncomeStatementAsOf] = useState('');

  const [depreciationSum, setDepreciationSum] = useState(0);
  const [interestPaidSum, setInterestPaidSum] = useState(0);
  const [transferNetIncomeToRetainedEarnings, setTransferNetIncomeToRetainedEarnings] = useState(1);

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
        // balance.costOfGoodsSold += sum;
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
      case 'interest_income_earned':
        balance.interestExpense -= sum;
        break;
      case 'interest_expense_paid':
        balance.interestExpense += sum;
        break;
      case 'goods_reduced_accounts':
        balance.costOfGoodsSold += sum;
      break;
    }
  }

  balance.depreciationExpense = (balance.depreciationExpense === 0) ? depreciationSum : balance.depreciationExpense;
  balance.interestExpense = (balance.interestExpense === 0) ? interestPaidSum : balance.interestExpense;; 

  const preAdjustmentBalance = JSON.parse(JSON.stringify(balance));

  // Calculate in adjustments
  const appliedAdjustments = [];
  for (let adj of adjustments) {

    if (adj.post === 'inventory') {

      const prevValue = (balance as any)['costOfGoodsSold'] as number;
      const changeInCostOfGoods = prevValue + adj.customValue;

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
    ppe: initBalance.PPE,
    accDepr: initBalance.accDepr + preAdjustmentBalance.depreciationExpense,
    netPPE: 0,
    prepaidInsurance: 0,
    inventory: initBalance.inventory,
    prepaidRent: preAdjustmentBalance.rentExpense,
    accountsReceivable: initBalance.accountsReceivable,
    cash: initBalance.cash,
    totalCurrentAssets: 0,
    totalAssets: 0,

    // rhs
    shareCap: 0,
    retainedEarnings: initBalance.retainedEarnings + (transferNetIncomeToRetainedEarnings === 1 ? balance.netIncome : 0),
    totalEquity: 0,
    bankLoanST: -initBalance.bankLoanST, // we need to inverse the bank loans:)
    bankLoanLT: -initBalance.bankLoanLT, // we need to inverse the bank loans:)
    accountsPayable: -initBalance.accountsPayable,
    interestPayable: 0,
    totalCurrentLiabilities: 0,
    totalEquityAndLiabilities: 0,
  }

  const processLineItem = (postName: string, finPosName: string, item: AddedItem) => {

    if (postName === 'Bank Loan (LT)') console.log(postName, 'debit:', item.item.debitPost, 'credit:', item.item.creditPost, item.sum);

    if (item.item.debitPost.toLowerCase().trim() === postName.toLowerCase().trim()) (financialPositionObj as any)[finPosName] += item.sum;
    if (item.item.creditPost.toLowerCase().trim() === postName.toLowerCase().trim()) (financialPositionObj as any)[finPosName] -= item.sum;
  }

  // Add line items
  for (let item of addedItems) {
    processLineItem('Property, Plant & Equipment', 'ppe', item);
    processLineItem('Accounts Receivable', 'accountsReceivable', item);
    processLineItem('Cash', 'cash', item);
    processLineItem('Shareholder cap', 'shareCap', item);
    processLineItem('Bank Loan (LT)', 'bankLoanLT', item);
    processLineItem('Bank Loan (ST)', 'bankLoanST', item);

    processLineItem('Accounts payable', 'accountsPayable', item);
    processLineItem('Inventory', 'inventory', item);

    //     accountsPayable
    // interestPayable
  }

  // If adjustment -- clear existing value
  const adjustmentPostNames = appliedAdjustments.map((el) => { return el.post });

  if (adjustmentPostNames.includes('depreciationExpense')) financialPositionObj.accDepr = initBalance.accDepr;
  if (adjustmentPostNames.includes('insuranceExpense')) financialPositionObj.prepaidInsurance = 0;
  // if (adjustmentPostNames.includes('interestExpense')) financialPositionObj.interestExpense = 0;
  // if (adjustmentPostNames.includes('rentExpense')) financialPositionObj.prepaidRent = 0;

  // Insurance
  financialPositionObj.prepaidInsurance = preAdjustmentBalance.insuranceExpense - balance.insuranceExpense;

  // Add adjustments 
  for (let applAdj of appliedAdjustments) {
    const { post, adjustmentValue } = applAdj;
    if (post === 'depreciationExpense') financialPositionObj.accDepr += adjustmentValue;
    if (post === 'costOfGoodsSold') financialPositionObj.inventory -= adjustmentValue;
    if (post === 'rentExpense') financialPositionObj.prepaidRent -= adjustmentValue;
    if (post === 'interestExpense') financialPositionObj.interestPayable += adjustmentValue; // TODO -- Interest payable !== Interest expense
  }


  // FINALLY BEFORE NET VALUES - SWAP THE SIGNS FOR BANK LOANS etc
  financialPositionObj.shareCap = -financialPositionObj.shareCap + initBalance.shareCap;
  financialPositionObj.bankLoanST *= -1;
  financialPositionObj.bankLoanLT *= -1;
  financialPositionObj.accountsPayable *= -1;

  // Calculate net ops
  financialPositionObj.netPPE = financialPositionObj.ppe - financialPositionObj.accDepr;
  financialPositionObj.totalCurrentAssets = financialPositionObj.prepaidInsurance + financialPositionObj.inventory + financialPositionObj.prepaidRent + financialPositionObj.accountsReceivable + financialPositionObj.cash;
  financialPositionObj.totalAssets = financialPositionObj.netPPE + financialPositionObj.totalCurrentAssets;

  financialPositionObj.totalEquity = (financialPositionObj.shareCap) + financialPositionObj.retainedEarnings;

  financialPositionObj.totalCurrentLiabilities = financialPositionObj.accountsPayable + financialPositionObj.interestPayable;
  financialPositionObj.totalEquityAndLiabilities = financialPositionObj.totalEquity + (financialPositionObj.bankLoanLT + financialPositionObj.bankLoanST) + financialPositionObj.totalCurrentLiabilities;

  // totalCurrentLiabilities
  // totalEquityAndLiabilities

  return (
    <div className="App">
      <h1>Journaling tool</h1>
      <Button variant="primary" onClick={(e) => {
        journalImport();
      }}>Import</Button><Button variant="primary" onClick={(e) => {
        journalExport();
      }}>Export</Button>
      <Container fluid={true}>
        <Row>
          <Col><h1>Init/Opening balance</h1>
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
                  <td>PP&E </td>
                  <td><input placeholder={'PP&E'} value={initBalance.PPE} onChange={(e) => { setInitBalanceValue('PPE', Number(e.target.value)); }} /></td>
                </tr>
                <tr>
                  <td>Accumulated Depreciation</td>
                  <td><input placeholder={'accDepr'} value={initBalance.accDepr} onChange={(e) => { setInitBalanceValue('accDepr', Number(e.target.value)); }} /></td>
                </tr>
                <tr>
                  <td colSpan={2}><i>Current assets</i></td>
                </tr>
                <tr>
                  <td>Inventory</td>
                  <td><input placeholder={'Inventory'} value={initBalance.inventory} onChange={(e) => { setInitBalanceValue('inventory', Number(e.target.value)); }} /></td>
                </tr>
                <tr>
                  <td>Accounts Receivable</td>
                  <td><input placeholder={'Accounts receivable'} value={initBalance.accountsReceivable} onChange={(e) => { setInitBalanceValue('accountsReceivable', Number(e.target.value)); }} /></td>
                </tr>
                <tr>
                  <td>Cash</td>
                  <td><input placeholder={'Cash'} value={initBalance.cash} onChange={(e) => { setInitBalanceValue('cash', Number(e.target.value)); }} /></td>
                </tr>
                <tr>
                  <td>Total Current Assets</td>
                  <td><strong>{numberWithCommas(initBalanceTotalCurrentAssets)}</strong></td>
                </tr>
                <tr>
                  <td><strong>Total Assets</strong></td>
                  <td><strong>{numberWithCommas(initBalanceTotalAssets)}</strong></td>
                </tr>
                <tr>
                  <td colSpan={2}><u>Equity and Liabilities</u></td>
                </tr>
                <tr>
                  <td colSpan={2}><i>Equity</i></td>
                </tr>
                <tr>
                  <td>Share Capital- Ordinary</td>
                  <td><input placeholder={'Share cap'} value={initBalance.shareCap} onChange={(e) => { setInitBalanceValue('shareCap', Number(e.target.value)); }} /></td>
                </tr>
                <tr>
                  <td>Retained earnings</td>
                  <td><input placeholder={'Retained earnings'} value={initBalance.retainedEarnings} onChange={(e) => { setInitBalanceValue('retainedEarnings', Number(e.target.value)); }}  /></td>
                </tr>
                <tr>
                  <td>Total Equity</td>
                  <td><strong>{numberWithCommas(initBalanceTotalEquity)}</strong></td>
                </tr>
                <tr>
                  <td colSpan={2}><i>Non-current Liabilities</i></td>
                </tr>
                <tr>
                  <td>Bank Loan (Long Term - IBD)</td>
                  <td><input placeholder={'Bank Loan LT'} value={initBalance.bankLoanLT} onChange={(e) => { setInitBalanceValue('bankLoanLT', Number(e.target.value)); }}   /></td>
                </tr>
                <tr>
                  <td colSpan={2}><i>Current Liabilities</i></td>
                </tr>
                <tr>
                  <td>Accounts Payable</td>
                  <td><input placeholder={'Accounts Payable'} value={initBalance.accountsPayable} onChange={(e) => { setInitBalanceValue('accountsPayable', Number(e.target.value)); }}   /></td>
                </tr>
                <tr>
                  <td>Bank Loan (Short Term - IBD)</td>
                  <td><input placeholder={'Bank Loan ST'} value={initBalance.bankLoanST} onChange={(e) => { setInitBalanceValue('bankLoanST', Number(e.target.value)); }}   /></td>
                </tr>
                <tr>
                  <td>Total Current Liabilities</td>
                  <td><strong>{numberWithCommas(initBalanceTotalCurrentLiabilities)}</strong></td>
                </tr>
                
                <tr>
                  <td><strong>Total Equity and Liabilities</strong></td>
                  <td><strong>{numberWithCommas(initBalanceTotalEquityAndLiabilities)}</strong></td>
                </tr>
              </tbody>
            </table>
          </Col>
          <Col>
            {initBalanceTotalEquityAndLiabilities === initBalanceTotalAssets && <>
              <Alert variant={'success'}><strong>OK</strong><br /> Init balance OK. LHS = RHS</Alert></>}
            {initBalanceTotalEquityAndLiabilities !== initBalanceTotalAssets && <>
              <Alert variant={'danger'}>
                <strong>ERROR</strong><br />
                Init balance invalid. LHS (total assets) must match RHS (equity+liabilities)</Alert>
            </>}
          </Col>
        </Row>
        <Row>
          <Col>
            <h1>Journaling</h1>
            <br />
            <table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th style={{ minWidth: 300 }}>Item</th>
                  <th style={{ minWidth: 150 }}>Dr.</th>
                  <th style={{ minWidth: 150 }}>Cr.</th>
                  <th style={{ minWidth: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {addedItems.map((el, index: number) => {
                  return <>
                    <tr className='first-row'>
                      <td>{index + 1}</td>
                      <td>{el.date}</td>
                      <td className='line-debit'>{el.item.debitPost}</td>
                      <td>{numberWithCommas(el.sum)}</td>
                      <td></td>
                      <td rowSpan={2}>
                        <Button variant={'dark'} onClick={() => { 
                          const addedItemsCop = JSON.parse(JSON.stringify(addedItems));
                          addedItemsCop.splice(index,1);
                          setAddedItems(addedItemsCop);  
                        }} ><i className="bi bi-trash"></i></Button>
                      </td>
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

          </Col>
          <Col><h1>Journal entries</h1>
            <h2>Select item:</h2>
            <select value={selectJournalItem} onChange={(e) => { setSelectJournalItem(e.target.value); }}>
              <option></option>
              {journalOpts.map((el) => { return <option value={el.id}>{el.sourceText}</option> })}
            </select>


            <h2>Enter date:</h2>
            <input type="string" placeholder="Date" value={selectDate} onChange={(e) => { setSelectDate(e.target.value); }} />


            <h2>Enter amt:</h2>
            <input type="number" placeholder="Sum" value={selectSum} onChange={(e) => { setSelectSum(Number(e.target.value)); }} />

            <Button variant="primary" onClick={(e) => {

              const journOpt = journalOpts.find((el) => { return el.id === selectJournalItem; })
              if (journOpt === undefined) return;

              setAddedItems(addedItems.concat([{ item: journOpt, sum: selectSum, date: selectDate }]));
              setSelectJournalItem('');
              setSelectDate('');
              setSelectSum(0);

            }}>Add item</Button></Col>
        </Row>
      </Container>

      <hr />
      <h1>Manual inputs for income statement</h1>
      <h2>As of (31.X):</h2>
      <input type="text" placeholder="As of (END MONTH)" value={incomeStatementAsOf} onChange={(e) => { setIncomeStatementAsOf(e.target.value); }} />
      <h3>Override: Depreciation (per year):</h3>
      <input type="number" placeholder="Sum" value={depreciationSum} onChange={(e) => { setDepreciationSum(Number(e.target.value)); }} />
      <h3>Override: NET Interest paid:</h3>
      <input type="number" placeholder="Sum" value={interestPaidSum} onChange={(e) => { setInterestPaidSum(Number(e.target.value)); }} />
      <h3>Transfer Net Income to Retained Earnings?</h3>
      {/* transferNetIncomeToRetainedEarnings */}
      <input type="radio" id="doTransferEarningsMale" name="doTransferEarnings" 
        value={1} 
        checked={transferNetIncomeToRetainedEarnings === 1}
        onChange={() => { setTransferNetIncomeToRetainedEarnings(1); }}
      />
      <label htmlFor="doTransferEarningsMale">Yes</label>{' '}
      <input type="radio" id="doTransferEarningsFemale" name="doTransferEarnings" 
        value={0} 
        checked={transferNetIncomeToRetainedEarnings === 0}
        onChange={() => { setTransferNetIncomeToRetainedEarnings(0); }}
      />
      <label htmlFor="doTransferEarningsFemale">No</label><br />


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


      <hr />


      <h3>Adjustments:</h3>
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
            <th></th>
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
                <td rowSpan={2}>
                  <Button variant={'dark'} onClick={() => { 
                    const adjustmentsCop = JSON.parse(JSON.stringify(adjustments));
                    adjustmentsCop.splice(index,1);
                    setAdjustments(adjustmentsCop);  
                  }} ><i className="bi bi-trash"></i></Button>
                </td>
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


      <hr />

      <Container fluid={true}>
        <Row>
          <Col><h1>Income statement as of 31.{incomeStatementAsOf}</h1>
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
           

            </Col>
          <Col>
            <h1>Financial Position as of 31.{incomeStatementAsOf}</h1>
            
            {financialPositionObj.totalAssets === financialPositionObj.totalEquityAndLiabilities && <>
              <Alert variant={'success'}><strong>OK</strong><br /> Balance match OK. LHS=RHS</Alert>
            </>}
            {financialPositionObj.totalAssets !== financialPositionObj.totalEquityAndLiabilities && <>
              <Alert variant={'danger'}>
                <strong>BALANCE ERROR</strong><br />
                There seems to be an inbalance between LHS (total assets) and RHS (equity + liabilities). Be aware!</Alert>
            </>}
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
                  <td>Accumulated Depreciation </td>
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
                  <td>{numberWithCommas(financialPositionObj.shareCap)}</td>
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
                  <td>Bank Loan (LT)</td>
                  <td>{numberWithCommas(financialPositionObj.bankLoanLT)}</td>
                </tr>
                <tr>
                  <td colSpan={2}><i>Current Liabilities</i></td>
                </tr>
                <tr>
                  <td>Bank Loan (ST)</td>
                  <td>{numberWithCommas(financialPositionObj.bankLoanST)}</td>
                </tr>
                <tr>
                  <td>Accounts Payable</td>
                  <td>{numberWithCommas(financialPositionObj.accountsPayable)}</td>
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
          </Col>
        </Row>
      </Container>




    </div>
  );
}

export default App;
