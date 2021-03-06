<?php

/**
 * Research Highlights engine
 * 
 * Copyright (c) 2014 Martin Porcheron <martin@porcheron.uk>
 * See LICENCE for legal information.
 */

namespace CDT\File;

/**
 * File header representation.
 * 
 * @author Martin Porcheron <martin@porcheron.uk>
 */
class Header {

	/** @var mixed[] Columns within the header */
	private $columns = array ();

	/** @var int Which column was `str_rem`, and thus gobbles remaining cols */
	private $gobbleFrom = -1;

	/**
	 * Construct the header representation, with the `string` text of the file
	 * header.
	 * 
	 * @see \CDT\File\Reader::read() for formatting
	 * @param string $row Header of the file. 
	 * @return void
	 */
	public function __construct ($row) {
		$cols = \explode (',', $row);
		foreach ($cols as $i => $col) {
			$data = \explode (':', \trim ($col));
			if (\count ($data) !== 2) {
				throw new \CDT\Error\Data ('File has incorrect number of parameters per column (has ' . count($data) .') in ' . $col);
			}
			$this->add ($data[0], $data[1]);
		}
	}

	/**
	 * Add a column to the header
	 * 
	 * @see \CDT\File\ColumnType for type information
	 * @param string $column Column name
	 * @param string $type Valid string representation of the column type
	 * @return void
	 */
	private function add ($column, $type) {
		$type = \CDT\File\ColumnType::fromString ($type);
		$this->columns[] = new \CDT\File\Column ($column, $type);

		if ($type == \CDT\File\ColumnType::LONG_STRING) {
			$this->gobbleFrom = \count ($this->columns) - 1;
		}
	}

	/**
	 * Get a column's information
	 * 
	 * @param int $id Index of the column (starting from 0)
	 * @return \CDT\File\Column
	 */
	public function get ($id) {
		if ($this->gobbleFrom >= 0 && $this->gobbleFrom < $id) {
			return $this->columns[$this->gobbleFrom];
		}

		return count ($this->columns) < $id ? null : $this->columns[$id];
	}

	/**
	 * Convert a `string` value to the correct type for the column
	 * 
	 * @param int $id Index of the column (starting from 0)
	 * @param string $str String representation to convert 
	 * @return mixed Value of the correct type
	 */
	public function toType ($id, $str) {
		$col = $this->get ($id);

		if (\is_null ($col)) {
			return null;
		}

		return \CDT\File\ColumnType::strTo ($col->type, $str);
	}

	/**
	 * @return \CDT\File\Column[] Array of columns
	 */
	public function toArray () {
		return $this->columns;
	}

}