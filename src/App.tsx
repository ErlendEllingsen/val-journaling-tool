import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface JournalItem {
  id: string
  sourceText: string
  creditPost: string
  debitPost: string
}

const newJournalItem = (id: string, sourceText: string, debitPost: string, creditPost: string): JournalItem => { return {
  id,
  sourceText,
  debitPost,
  creditPost,
};  }


const journalOpts: JournalItem[] = [
  newJournalItem('shareholders_invested', 'shareholders invested', 'Cash', 'Shareholder cap'),
  newJournalItem('got_loan', 'got a loan', 'Cash', 'Bank Loan'),
  newJournalItem('prepaid_rent_cash', 'the firm rented offices for the whole of a year (paid cash)', 'Prepaid rent', 'Cash'),
  newJournalItem('bought_ppe_cash', 'the firm bought equipment (paid cash)', 'Property, Plant & Equipment', 'Cash'),
  newJournalItem('bought_inventory_credit', 'the firm bought inventory (credit)', 'Inventory', 'Accounts payable'),
  newJournalItem('goods_sold_account', 'the firm sold goods on account', 'Accounts Receivable', 'Sales Revenue'),
  newJournalItem('prepaid_insurance', 'the firm paid for a one-year insurance policy (cash)', 'Prepaid Insurance', 'Cash'),
  newJournalItem('bought_inventory_on_account', 'the firm purchased inventory on account', 'Inventory', 'Accounts payable '),
  newJournalItem('received_payment_prev_sales', 'received payment from clients from previous sales', 'Cash', 'Accounts Receivable'),
  newJournalItem('paid_inventories_purchased_account', 'paid for inventories purchased on account', 'Accounts Payable ', 'Cash'),
  newJournalItem('paid_salaries', ' the firm paid for the salaries of the first semester of the year.', 'Salaries and Wages Expense ', 'Cash'),
];

interface AddedItem {
  item: JournalItem,
  date: string,
  sum: number
}

function App() {

  const [selectJournalItem, setSelectJournalItem] = useState('');
  const [selectDate, setSelectDate] = useState('');
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const [selectSum, setSelectSum] = useState(0);

  return (
    <div className="App">
      <h1>Input</h1>
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
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Date</th>
            <th style={{minWidth: 300}}>Item</th>
            <th style={{minWidth: 150}}>Dr.</th>
            <th style={{minWidth: 150}}>Cr.</th>
          </tr>
        </thead>
        <tbody>
          {addedItems.map((el, index) => { 
            return <>
              <tr className='first-row'>
                <td>{index+1}</td>
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
          {/* <tr>
            <td>1</td>
            <td>1.2</td>
            <td className={'line-debit'}>Cash</td>
            <td>1 000 000</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td className={'line-credit'}>Shareholder Cap</td>
            <td></td>
            <td>1 000 000</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
}

export default App;
