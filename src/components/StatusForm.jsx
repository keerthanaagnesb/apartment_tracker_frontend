import { useRef } from 'react';
import { STATUS_LABEL } from '../api';

/** Status dropdown + Update button. The dropdown keeps what you picked even when live data refreshes. */
export default function StatusForm({ complaint, allowed, onSubmit }) {
  const select = useRef(null);
  const selectable = allowed.includes(complaint.status);

  const submit = (e) => {
    e.preventDefault();
    onSubmit(complaint.id, select.current.value);
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      <select ref={select} key={complaint.status} defaultValue={selectable ? complaint.status : ''} required>
        {!selectable && <option value="" disabled>Select status</option>}
        {allowed.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
      </select>
      <button type="submit" className="btn btn-small btn-primary">Update</button>
    </form>
  );
}
