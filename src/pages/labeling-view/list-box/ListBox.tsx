import { cn } from "@src/shared/utils"
import React, { useState } from "react"

import styles from "./ListBox.module.scss"
import Button from "../../../components/button"
import { Label } from "../labeling-board/Label"

type Props = {
  className?: string
  labels?: Label[]
  onItemClick?: (id: string) => (evt: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
}

export default function ListBox(p: Props) {
  const [isOpen, setOpen] = useState<boolean>(false)

  return (
    <aside className={cn(styles.listBox, p.className)}>
      <Button.Icon className={cn(styles.toggle, isOpen && styles.open)} onClick={() => setOpen(!isOpen)}>
        {isOpen ? <span className={"i-outline:arrow-left"} /> : <span className={"i-outline:arrow-right"} />}
      </Button.Icon>
      {isOpen && (
        <>
          <section>
            <h4>{"Labels"}</h4>
          </section>
          <ul>
            {p.labels?.map((label) => (
              <li
                className={cn(label.selected && styles.active)}
                onClick={p.onItemClick && p.onItemClick(label.id)}
                key={label.id}
              >
                <div className={styles.name}>{label.name}</div>
                <div className={styles.coordinate}>{`(${label.x}, ${label.y})`}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  )
}
