import * as React from 'react';
import { useState, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export default function ToggleBtn(
    { toggleName, checked, setChecked }: {
        toggleName: string,
        checked: boolean,
        setChecked: (checked: boolean) => void
    }
) {
    return (
        <div className="flex flex-row justify-between items-center ">
            <p className='pl-10'>
                {toggleName}
            </p>
            <div className='pr-3'>
                <FormControlLabel control={<Switch />}
                    checked={checked}
                    label={""}
                    onChange={() => setChecked(!checked)}
                />
            </div>
        </div>
    );
}