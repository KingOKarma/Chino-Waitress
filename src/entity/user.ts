/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { Inventory } from "./inventory";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: "000000000000000000" })
    uid!: string;

    @Column({ nullable: true })
    serverId!: string;

    @Column({ nullable: true })
    tag!: string;

    @Column({ nullable: true })
    avatar!: string;

    @Column({ default: 0 })
    balance!: number;

    @OneToMany(() => Inventory, (inventory) => inventory.user)
    inventory!: Inventory;
}
