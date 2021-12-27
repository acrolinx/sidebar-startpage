#!/usr/bin/env python2
#
# Copyright 2017 Acrolinx GmbH
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import argparse
import codecs
import datetime
import re
import sys


def to_c_string(string):
    return r'"%s"' % (
        # Escape all non-printing characters:
        re.sub(
            r'[^ -~]',
            lambda m: r"\x%02X" % ord(m.group()),
            # Escape special, printing characters:
            re.sub(
                r'[\\"?]',
                r"\\\g<0>",
                string
            )
        )
    )

def ensure_valid_version(arg):
    if not re.search(r"^\d+(?:\.\d+){3}$", arg):
        raise argparse.ArgumentTypeError(
            "Version must be of format N.N.N.N, where N is a positive integer."
        )

    return arg

def get_argparser():
    p = argparse.ArgumentParser(
        description="Generate a version header file for the build.",
        epilog="This file is intended to be included into a resource script."
    )

    p.add_argument(
        "-v", "--version",
        default="1.0.0.0",
        type=ensure_valid_version,
        help="Version of the built application. Default: %(default)s"
    )
    p.add_argument(
        "-n", "--filename",
        default="Application.dll",
        help="Filename of the built application. Default: %(default)s"
    )
    p.add_argument(
        "-y", "--first-copyright-year",
        type=int,
        help="If given, the copyright year will be a range, starting "
             "with this year."
    )

    p.add_argument(
        "out_file",
        help="Output file name."
    )

    return p

def main():
    args = get_argparser().parse_args()

    with codecs.open(args.out_file, "wb", "utf-8") as fh:
        escaped_filename = to_c_string(args.filename)
        fh.write("#define BUILD_DLL_NAME %s\r\n" % escaped_filename)

        current_year = datetime.datetime.utcnow().year
        if args.first_copyright_year is not None and \
                args.first_copyright_year != current_year:
            year_range = "%s-%s" % (args.first_copyright_year, current_year)
        else:
            year_range = str(current_year)
        fh.write("#define BUILD_COPYRIGHT_YEARS %s\r\n" % to_c_string(year_range))

        fh.write("#define BUILD_VER_TUPLE %s\r\n" % (
                re.sub(r"\b0+(?=0\b|[1-9])", "", args.version).replace(".", ",")
            )
        )
        fh.write("#define BUILD_VER_STRING %s\r\n" % to_c_string(args.version))


if __name__ == "__main__":
    sys.exit(main())
